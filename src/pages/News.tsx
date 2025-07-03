import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Newspaper, TrendingUp, TrendingDown, Clock, ExternalLink, Filter, Search } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  url: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  category: 'market' | 'earnings' | 'economy' | 'crypto' | 'forex';
  symbols?: string[];
}

const News: React.FC = () => {
  const { state: userState } = useUser();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadNews();
  }, []);

  useEffect(() => {
    filterNews();
  }, [news, searchTerm, selectedCategory, selectedSentiment]);

  const loadNews = async () => {
    try {
      // Simulate loading news data
      const mockNews: NewsItem[] = [
        {
          id: '1',
          title: 'Tech Stocks Rally on Strong Earnings Reports',
          summary: 'Major technology companies reported better-than-expected earnings, driving the NASDAQ to new highs.',
          source: 'Financial Times',
          publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          url: '#',
          sentiment: 'positive',
          category: 'earnings',
          symbols: ['AAPL', 'GOOGL', 'MSFT']
        },
        {
          id: '2',
          title: 'Federal Reserve Signals Potential Rate Cut',
          summary: 'The Fed indicated it may consider lowering interest rates in response to economic data.',
          source: 'Reuters',
          publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          url: '#',
          sentiment: 'positive',
          category: 'economy'
        },
        {
          id: '3',
          title: 'Bitcoin Surges Past $50,000 Resistance Level',
          summary: 'Cryptocurrency markets show strong momentum as Bitcoin breaks through key resistance.',
          source: 'CoinDesk',
          publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          url: '#',
          sentiment: 'positive',
          category: 'crypto',
          symbols: ['BTC', 'ETH']
        },
        {
          id: '4',
          title: 'Oil Prices Drop on Increased Supply Concerns',
          summary: 'Crude oil prices fell as OPEC+ production increases and demand concerns weigh on markets.',
          source: 'Bloomberg',
          publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          url: '#',
          sentiment: 'negative',
          category: 'market'
        },
        {
          id: '5',
          title: 'Retail Sales Data Shows Consumer Confidence',
          summary: 'Strong retail sales figures indicate continued consumer spending despite economic headwinds.',
          source: 'MarketWatch',
          publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
          url: '#',
          sentiment: 'positive',
          category: 'economy'
        }
      ];
      
      setNews(mockNews);
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterNews = () => {
    let filtered = [...news];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.symbols?.some(symbol => symbol.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (selectedSentiment !== 'all') {
      filtered = filtered.filter(item => item.sentiment === selectedSentiment);
    }

    setFilteredNews(filtered);
  };

  const getSentimentIcon = (sentiment: NewsItem['sentiment']) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSentimentColor = (sentiment: NewsItem['sentiment']) => {
    switch (sentiment) {
      case 'positive':
        return 'border-green-500/50 bg-green-500/10';
      case 'negative':
        return 'border-red-500/50 bg-red-500/10';
      default:
        return 'border-gray-500/50 bg-gray-500/10';
    }
  };

  const getCategoryColor = (category: NewsItem['category']) => {
    switch (category) {
      case 'market':
        return 'bg-blue-500/20 text-blue-400';
      case 'earnings':
        return 'bg-green-500/20 text-green-400';
      case 'economy':
        return 'bg-purple-500/20 text-purple-400';
      case 'crypto':
        return 'bg-orange-500/20 text-orange-400';
      case 'forex':
        return 'bg-pink-500/20 text-pink-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="px-4 pt-4 pb-24 min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading news...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-24 min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-primary-300 drop-shadow-glow">Market News</h1>
        <button
          onClick={() => navigate('/watchlist')}
          className="bg-primary-500 hover:bg-primary-600 text-white rounded-full px-4 py-2 shadow-holographic transition-all duration-200 active:scale-95"
        >
          Watchlist
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search news, symbols, or topics..."
            className="w-full pl-10 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
              selectedCategory === 'all' 
                ? 'bg-primary-500 text-white' 
                : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedCategory('market')}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
              selectedCategory === 'market' 
                ? 'bg-primary-500 text-white' 
                : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
            }`}
          >
            Market
          </button>
          <button
            onClick={() => setSelectedCategory('earnings')}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
              selectedCategory === 'earnings' 
                ? 'bg-primary-500 text-white' 
                : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
            }`}
          >
            Earnings
          </button>
          <button
            onClick={() => setSelectedCategory('economy')}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
              selectedCategory === 'economy' 
                ? 'bg-primary-500 text-white' 
                : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
            }`}
          >
            Economy
          </button>
          <button
            onClick={() => setSelectedCategory('crypto')}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
              selectedCategory === 'crypto' 
                ? 'bg-primary-500 text-white' 
                : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
            }`}
          >
            Crypto
          </button>
        </div>

        {/* Sentiment Filter */}
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedSentiment('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              selectedSentiment === 'all' 
                ? 'bg-primary-500 text-white' 
                : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
            }`}
          >
            All Sentiment
          </button>
          <button
            onClick={() => setSelectedSentiment('positive')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              selectedSentiment === 'positive' 
                ? 'bg-green-500 text-white' 
                : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
            }`}
          >
            Positive
          </button>
          <button
            onClick={() => setSelectedSentiment('negative')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              selectedSentiment === 'negative' 
                ? 'bg-red-500 text-white' 
                : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
            }`}
          >
            Negative
          </button>
        </div>
      </div>

      {/* News List */}
      <div className="space-y-4">
        {filteredNews.length === 0 ? (
          <div className="text-center py-12">
            <Newspaper className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No News Found</h3>
            <p className="text-gray-500 mb-4">
              {news.length === 0 ? 'No news available at the moment' : 'No news matches your filters'}
            </p>
            {news.length > 0 && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedSentiment('all');
                }}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          filteredNews.map(item => (
            <div
              key={item.id}
              className={`bg-dark-800/70 rounded-xl p-4 shadow-glass backdrop-blur-xs border ${getSentimentColor(item.sentiment)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-2 line-clamp-2">{item.title}</h3>
                  <p className="text-gray-300 text-sm mb-3 line-clamp-3">{item.summary}</p>
                </div>
                <div className="flex items-center space-x-2 ml-3">
                  {getSentimentIcon(item.sentiment)}
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-gray-400">{item.source}</span>
                  <span className="text-xs text-gray-400">{formatTimeAgo(item.publishedAt)}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                  {item.category}
                </span>
              </div>

              {item.symbols && item.symbols.length > 0 && (
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-xs text-gray-400">Related:</span>
                  {item.symbols.map(symbol => (
                    <span
                      key={symbol}
                      className="px-2 py-1 bg-dark-700 rounded text-xs text-primary-400 font-medium"
                    >
                      {symbol}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => window.open(item.url, '_blank')}
                  className="flex items-center space-x-1 text-primary-400 hover:text-primary-300 text-sm transition-colors"
                >
                  <span>Read More</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default News; 