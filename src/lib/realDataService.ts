import axios from 'axios';

export interface MarketDataProvider {
  name: string;
  apiKey: string;
  baseUrl: string;
  rateLimit: number;
  lastRequest: number;
}

export interface PriceData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: string;
}

export interface HistoricalData {
  symbol: string;
  data: {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
  timeframe: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  url: string;
  publishedAt: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  symbols: string[];
  category: string;
}

export interface EconomicEvent {
  id: string;
  title: string;
  country: string;
  currency: string;
  impact: 'high' | 'medium' | 'low';
  date: string;
  time: string;
  forecast: string;
  previous: string;
  actual?: string;
}

export interface MarketSentiment {
  symbol: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  score: number;
  confidence: number;
  sources: string[];
  timestamp: string;
}

class RealDataService {
  private providers: Map<string, MarketDataProvider> = new Map();
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 30000; // 30 seconds

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Alpha Vantage
    this.providers.set('alphaVantage', {
      name: 'Alpha Vantage',
      apiKey: process.env.ALPHA_VANTAGE_API_KEY || '',
      baseUrl: 'https://www.alphavantage.co/query',
      rateLimit: 500,
      lastRequest: 0
    });

    // Polygon
    this.providers.set('polygon', {
      name: 'Polygon',
      apiKey: process.env.POLYGON_API_KEY || '',
      baseUrl: 'https://api.polygon.io',
      rateLimit: 1000,
      lastRequest: 0
    });

    // CoinGecko
    this.providers.set('coingecko', {
      name: 'CoinGecko',
      apiKey: process.env.COINGECKO_API_KEY || '',
      baseUrl: 'https://api.coingecko.com/api/v3',
      rateLimit: 100,
      lastRequest: 0
    });

    // Yahoo Finance
    this.providers.set('yfinance', {
      name: 'Yahoo Finance',
      apiKey: process.env.YFINANCE_API_KEY || '',
      baseUrl: 'https://yfapi.net/v6',
      rateLimit: 2000,
      lastRequest: 0
    });

    // News API
    this.providers.set('news', {
      name: 'News API',
      apiKey: process.env.NEWS_API_KEY || '',
      baseUrl: 'https://newsapi.org/v2',
      rateLimit: 100,
      lastRequest: 0
    });

    // Finnhub
    this.providers.set('finnhub', {
      name: 'Finnhub',
      apiKey: process.env.FINNHUB_API_KEY || '',
      baseUrl: 'https://finnhub.io/api/v1',
      rateLimit: 60,
      lastRequest: 0
    });
  }

  private async rateLimit(providerName: string): Promise<void> {
    const provider = this.providers.get(providerName);
    if (!provider) return;

    const now = Date.now();
    const timeSinceLastRequest = now - provider.lastRequest;
    const minInterval = 60000 / provider.rateLimit; // Convert rate limit to milliseconds

    if (timeSinceLastRequest < minInterval) {
      await new Promise(resolve => setTimeout(resolve, minInterval - timeSinceLastRequest));
    }

    provider.lastRequest = Date.now();
  }

  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async getRealTimePrice(symbol: string, provider?: string): Promise<PriceData> {
    const cacheKey = `price_${symbol}_${provider || 'default'}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const selectedProvider = provider || this.selectBestProvider(symbol);
    await this.rateLimit(selectedProvider);

    try {
      let priceData: PriceData;

      switch (selectedProvider) {
        case 'alphaVantage':
          priceData = await this.getAlphaVantagePrice(symbol);
          break;
        case 'polygon':
          priceData = await this.getPolygonPrice(symbol);
          break;
        case 'coingecko':
          priceData = await this.getCoinGeckoPrice(symbol);
          break;
        case 'yfinance':
          priceData = await this.getYahooFinancePrice(symbol);
          break;
        default:
          throw new Error(`Unsupported provider: ${selectedProvider}`);
      }

      this.setCachedData(cacheKey, priceData);
      return priceData;
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      throw error;
    }
  }

  async getHistoricalData(symbol: string, timeframe: string, provider?: string): Promise<HistoricalData> {
    const cacheKey = `historical_${symbol}_${timeframe}_${provider || 'default'}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const selectedProvider = provider || this.selectBestProvider(symbol);
    await this.rateLimit(selectedProvider);

    try {
      let historicalData: HistoricalData;

      switch (selectedProvider) {
        case 'alphaVantage':
          historicalData = await this.getAlphaVantageHistorical(symbol, timeframe);
          break;
        case 'polygon':
          historicalData = await this.getPolygonHistorical(symbol, timeframe);
          break;
        case 'coingecko':
          historicalData = await this.getCoinGeckoHistorical(symbol, timeframe);
          break;
        default:
          throw new Error(`Unsupported provider: ${selectedProvider}`);
      }

      this.setCachedData(cacheKey, historicalData);
      return historicalData;
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      throw error;
    }
  }

  async getNews(symbols?: string[], category?: string, limit: number = 20): Promise<NewsItem[]> {
    const cacheKey = `news_${symbols?.join(',') || 'all'}_${category || 'all'}_${limit}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    await this.rateLimit('news');

    try {
      const provider = this.providers.get('news');
      if (!provider) throw new Error('News provider not configured');

      const params: any = {
        apiKey: provider.apiKey,
        pageSize: limit,
        language: 'en',
        sortBy: 'publishedAt'
      };

      if (symbols && symbols.length > 0) {
        params.q = symbols.join(' OR ');
      }

      if (category) {
        params.category = category;
      }

      const response = await axios.get(`${provider.baseUrl}/everything`, { params });
      
      const newsItems: NewsItem[] = response.data.articles.map((article: any, index: number) => ({
        id: `news_${index}`,
        title: article.title,
        summary: article.description,
        content: article.content,
        source: article.source.name,
        url: article.url,
        publishedAt: article.publishedAt,
        sentiment: this.analyzeSentiment(article.title + ' ' + article.description),
        symbols: this.extractSymbols(article.title + ' ' + article.description),
        category: category || 'general'
      }));

      this.setCachedData(cacheKey, newsItems);
      return newsItems;
    } catch (error) {
      console.error('Error fetching news:', error);
      throw error;
    }
  }

  async getEconomicCalendar(): Promise<EconomicEvent[]> {
    const cacheKey = 'economic_calendar';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    await this.rateLimit('finnhub');

    try {
      const provider = this.providers.get('finnhub');
      if (!provider) throw new Error('Finnhub provider not configured');

      const response = await axios.get(`${provider.baseUrl}/calendar/economic`, {
        params: {
          token: provider.apiKey,
          from: new Date().toISOString().split('T')[0],
          to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      });

      const events: EconomicEvent[] = response.data.economicCalendar.map((event: any) => ({
        id: event.id,
        title: event.event,
        country: event.country,
        currency: event.currency,
        impact: event.impact,
        date: event.date,
        time: event.time,
        forecast: event.forecast,
        previous: event.previous,
        actual: event.actual
      }));

      this.setCachedData(cacheKey, events);
      return events;
    } catch (error) {
      console.error('Error fetching economic calendar:', error);
      throw error;
    }
  }

  async getMarketSentiment(symbol: string): Promise<MarketSentiment> {
    const cacheKey = `sentiment_${symbol}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    await this.rateLimit('finnhub');

    try {
      const provider = this.providers.get('finnhub');
      if (!provider) throw new Error('Finnhub provider not configured');

      const response = await axios.get(`${provider.baseUrl}/news/sentiment`, {
        params: {
          token: provider.apiKey,
          symbol: symbol
        }
      });

      const sentiment: MarketSentiment = {
        symbol,
        sentiment: this.calculateSentiment(response.data.sentiment),
        score: response.data.sentiment,
        confidence: response.data.buzz?.buzz || 0,
        sources: response.data.sources || [],
        timestamp: new Date().toISOString()
      };

      this.setCachedData(cacheKey, sentiment);
      return sentiment;
    } catch (error) {
      console.error(`Error fetching sentiment for ${symbol}:`, error);
      throw error;
    }
  }

  private selectBestProvider(symbol: string): string {
    // Logic to select the best provider based on symbol type
    if (symbol.includes('USD') || symbol.includes('EUR') || symbol.includes('GBP')) {
      return 'alphaVantage'; // Good for forex
    } else if (symbol.includes('BTC') || symbol.includes('ETH') || symbol.includes('USDT')) {
      return 'coingecko'; // Good for crypto
    } else if (symbol.includes('.') || symbol.length <= 5) {
      return 'polygon'; // Good for stocks
    } else {
      return 'yfinance'; // Default fallback
    }
  }

  private async getAlphaVantagePrice(symbol: string): Promise<PriceData> {
    const provider = this.providers.get('alphaVantage');
    if (!provider) throw new Error('Alpha Vantage provider not configured');

    const response = await axios.get(provider.baseUrl, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: symbol,
        apikey: provider.apiKey
      }
    });

    const quote = response.data['Global Quote'];
    return {
      symbol: quote['01. symbol'],
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      volume: parseInt(quote['06. volume']),
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
      open: parseFloat(quote['02. open']),
      previousClose: parseFloat(quote['08. previous close']),
      timestamp: quote['07. latest trading day']
    };
  }

  private async getPolygonPrice(symbol: string): Promise<PriceData> {
    const provider = this.providers.get('polygon');
    if (!provider) throw new Error('Polygon provider not configured');

    const response = await axios.get(`${provider.baseUrl}/v2/aggs/ticker/${symbol}/prev`, {
      params: {
        apikey: provider.apiKey
      }
    });

    const result = response.data.results[0];
    return {
      symbol,
      price: result.c,
      change: result.c - result.o,
      changePercent: ((result.c - result.o) / result.o) * 100,
      volume: result.v,
      high: result.h,
      low: result.l,
      open: result.o,
      previousClose: result.o,
      timestamp: new Date(result.t).toISOString()
    };
  }

  private async getCoinGeckoPrice(symbol: string): Promise<PriceData> {
    const provider = this.providers.get('coingecko');
    if (!provider) throw new Error('CoinGecko provider not configured');

    const response = await axios.get(`${provider.baseUrl}/simple/price`, {
      params: {
        ids: symbol.toLowerCase(),
        vs_currencies: 'usd',
        include_24hr_change: true,
        include_24hr_vol: true,
        include_last_updated_at: true
      }
    });

    const data = response.data[symbol.toLowerCase()];
    return {
      symbol: symbol.toUpperCase(),
      price: data.usd,
      change: data.usd_24h_change,
      changePercent: data.usd_24h_change,
      volume: data.usd_24h_vol,
      high: data.usd, // CoinGecko doesn't provide OHLC in simple endpoint
      low: data.usd,
      open: data.usd,
      previousClose: data.usd,
      timestamp: new Date(data.last_updated_at * 1000).toISOString()
    };
  }

  private async getYahooFinancePrice(symbol: string): Promise<PriceData> {
    const provider = this.providers.get('yfinance');
    if (!provider) throw new Error('Yahoo Finance provider not configured');

    const response = await axios.get(`${provider.baseUrl}/finance/quote`, {
      params: {
        symbols: symbol,
        apikey: provider.apiKey
      }
    });

    const quote = response.data.quoteResponse.result[0];
    return {
      symbol: quote.symbol,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      volume: quote.regularMarketVolume,
      high: quote.regularMarketDayHigh,
      low: quote.regularMarketDayLow,
      open: quote.regularMarketOpen,
      previousClose: quote.regularMarketPreviousClose,
      timestamp: new Date(quote.regularMarketTime * 1000).toISOString()
    };
  }

  private async getAlphaVantageHistorical(symbol: string, timeframe: string): Promise<HistoricalData> {
    const provider = this.providers.get('alphaVantage');
    if (!provider) throw new Error('Alpha Vantage provider not configured');

    const functionMap: { [key: string]: string } = {
      '1D': 'TIME_SERIES_DAILY',
      '1W': 'TIME_SERIES_WEEKLY',
      '1M': 'TIME_SERIES_MONTHLY'
    };

    const response = await axios.get(provider.baseUrl, {
      params: {
        function: functionMap[timeframe] || 'TIME_SERIES_DAILY',
        symbol: symbol,
        apikey: provider.apiKey
      }
    });

    const timeSeriesKey = Object.keys(response.data).find(key => key.includes('Time Series'));
    const timeSeries = response.data[timeSeriesKey];

    const data = Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
      date,
      open: parseFloat(values['1. open']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      close: parseFloat(values['4. close']),
      volume: parseInt(values['5. volume'])
    }));

    return {
      symbol,
      data: data.slice(0, 100), // Limit to last 100 data points
      timeframe
    };
  }

  private async getPolygonHistorical(symbol: string, timeframe: string): Promise<HistoricalData> {
    const provider = this.providers.get('polygon');
    if (!provider) throw new Error('Polygon provider not configured');

    const response = await axios.get(`${provider.baseUrl}/v2/aggs/ticker/${symbol}/range/1/day`, {
      params: {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
        apikey: provider.apiKey
      }
    });

    const data = response.data.results.map((result: any) => ({
      date: new Date(result.t).toISOString().split('T')[0],
      open: result.o,
      high: result.h,
      low: result.l,
      close: result.c,
      volume: result.v
    }));

    return {
      symbol,
      data,
      timeframe
    };
  }

  private async getCoinGeckoHistorical(symbol: string, timeframe: string): Promise<HistoricalData> {
    const provider = this.providers.get('coingecko');
    if (!provider) throw new Error('CoinGecko provider not configured');

    const daysMap: { [key: string]: number } = {
      '1D': 1,
      '1W': 7,
      '1M': 30
    };

    const response = await axios.get(`${provider.baseUrl}/coins/${symbol.toLowerCase()}/ohlc`, {
      params: {
        vs_currency: 'usd',
        days: daysMap[timeframe] || 30
      }
    });

    const data = response.data.map((item: number[]) => ({
      date: new Date(item[0]).toISOString().split('T')[0],
      open: item[1],
      high: item[2],
      low: item[3],
      close: item[4],
      volume: 0 // CoinGecko OHLC doesn't include volume
    }));

    return {
      symbol,
      data,
      timeframe
    };
  }

  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['bullish', 'surge', 'rally', 'gain', 'profit', 'positive', 'up', 'higher'];
    const negativeWords = ['bearish', 'drop', 'fall', 'loss', 'decline', 'negative', 'down', 'lower'];

    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private extractSymbols(text: string): string[] {
    // Simple regex to extract potential stock symbols
    const symbolRegex = /\b[A-Z]{1,5}\b/g;
    return text.match(symbolRegex) || [];
  }

  private calculateSentiment(score: number): 'bullish' | 'bearish' | 'neutral' {
    if (score > 0.1) return 'bullish';
    if (score < -0.1) return 'bearish';
    return 'neutral';
  }
}

export const realDataService = new RealDataService();
export default realDataService; 