import axios from 'axios';

export interface AIProvider {
  name: 'openai' | 'groq' | 'gemini';
  apiKey: string;
  baseUrl?: string;
  model: string;
}

export interface AIStreamConfig {
  providers: AIProvider[];
  defaultProvider: string;
  maxTokens: number;
  temperature: number;
}

export interface AIAnalysisRequest {
  provider?: string;
  prompt: string;
  context?: any;
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
}

export interface AIAnalysisResponse {
  content: string;
  provider: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: any;
}

export interface TradeAnalysis {
  tradeId: string;
  analysis: string;
  recommendations: string[];
  riskScore: number;
  confidence: number;
  patterns: string[];
  improvements: string[];
}

export interface PortfolioAnalysis {
  overallScore: number;
  riskAssessment: string;
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

class AIStreamService {
  private config: AIStreamConfig;
  private providers: Map<string, AIProvider> = new Map();

  constructor(config: AIStreamConfig) {
    this.config = config;
    this.initializeProviders();
  }

  private initializeProviders(): void {
    this.config.providers.forEach(provider => {
      this.providers.set(provider.name, provider);
    });
  }

  private getProvider(name: string): AIProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Provider ${name} not found`);
    }
    return provider;
  }

  async analyzeTrade(trade: any, provider?: string): Promise<TradeAnalysis> {
    const prompt = this.buildTradeAnalysisPrompt(trade);
    
    const response = await this.streamAnalysis({
      provider: provider || this.config.defaultProvider,
      prompt,
      context: { trade },
      temperature: 0.7,
      maxTokens: 1000
    });

    return this.parseTradeAnalysis(response.content, trade.id);
  }

  async analyzePortfolio(trades: any[], provider?: string): Promise<PortfolioAnalysis> {
    const prompt = this.buildPortfolioAnalysisPrompt(trades);
    
    const response = await this.streamAnalysis({
      provider: provider || this.config.defaultProvider,
      prompt,
      context: { trades },
      temperature: 0.8,
      maxTokens: 1500
    });

    return this.parsePortfolioAnalysis(response.content);
  }

  async generateStrategy(symbol: string, timeframe: string, provider?: string): Promise<string> {
    const prompt = this.buildStrategyPrompt(symbol, timeframe);
    
    const response = await this.streamAnalysis({
      provider: provider || this.config.defaultProvider,
      prompt,
      context: { symbol, timeframe },
      temperature: 0.9,
      maxTokens: 2000
    });

    return response.content;
  }

  async getMarketInsights(symbols: string[], provider?: string): Promise<string> {
    const prompt = this.buildMarketInsightsPrompt(symbols);
    
    const response = await this.streamAnalysis({
      provider: provider || this.config.defaultProvider,
      prompt,
      context: { symbols },
      temperature: 0.7,
      maxTokens: 1200
    });

    return response.content;
  }

  async streamAnalysis(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const provider = this.getProvider(request.provider || this.config.defaultProvider);
    
    switch (provider.name) {
      case 'openai':
        return this.streamOpenAI(provider, request);
      case 'groq':
        return this.streamGroq(provider, request);
      case 'gemini':
        return this.streamGemini(provider, request);
      default:
        throw new Error(`Unsupported provider: ${provider.name}`);
    }
  }

  private async streamOpenAI(provider: AIProvider, request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const url = provider.baseUrl || 'https://api.openai.com/v1/chat/completions';
    
    const response = await axios.post(url, {
      model: provider.model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert trading analyst and financial advisor. Provide detailed, actionable insights based on the data provided.'
        },
        {
          role: 'user',
          content: request.prompt
        }
      ],
      max_tokens: request.maxTokens || this.config.maxTokens,
      temperature: request.temperature || this.config.temperature,
      stream: request.stream || false
    }, {
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (request.stream) {
      return this.handleOpenAIStream(response);
    } else {
      return {
        content: response.data.choices[0].message.content,
        provider: provider.name,
        model: provider.model,
        usage: response.data.usage
      };
    }
  }

  private async streamGroq(provider: AIProvider, request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const url = provider.baseUrl || 'https://api.groq.com/openai/v1/chat/completions';
    
    const response = await axios.post(url, {
      model: provider.model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert trading analyst and financial advisor. Provide detailed, actionable insights based on the data provided.'
        },
        {
          role: 'user',
          content: request.prompt
        }
      ],
      max_tokens: request.maxTokens || this.config.maxTokens,
      temperature: request.temperature || this.config.temperature,
      stream: request.stream || false
    }, {
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (request.stream) {
      return this.handleGroqStream(response);
    } else {
      return {
        content: response.data.choices[0].message.content,
        provider: provider.name,
        model: provider.model,
        usage: response.data.usage
      };
    }
  }

  private async streamGemini(provider: AIProvider, request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const url = provider.baseUrl || `https://generativelanguage.googleapis.com/v1beta/models/${provider.model}:generateContent`;
    
    const response = await axios.post(url, {
      contents: [
        {
          parts: [
            {
              text: `You are an expert trading analyst and financial advisor. Provide detailed, actionable insights based on the data provided.\n\n${request.prompt}`
            }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: request.maxTokens || this.config.maxTokens,
        temperature: request.temperature || this.config.temperature
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      params: {
        key: provider.apiKey
      }
    });

    return {
      content: response.data.candidates[0].content.parts[0].text,
      provider: provider.name,
      model: provider.model
    };
  }

  private handleOpenAIStream(response: any): AIAnalysisResponse {
    // Implementation for handling OpenAI streaming
    // This would involve processing the stream and accumulating the response
    return {
      content: 'Streaming response from OpenAI',
      provider: 'openai',
      model: 'gpt-4'
    };
  }

  private handleGroqStream(response: any): AIAnalysisResponse {
    // Implementation for handling Groq streaming
    return {
      content: 'Streaming response from Groq',
      provider: 'groq',
      model: 'llama3-8b-8192'
    };
  }

  private buildTradeAnalysisPrompt(trade: any): string {
    return `
Analyze this trade and provide detailed insights:

Symbol: ${trade.symbol}
Type: ${trade.type}
Entry Price: ${trade.entryPrice}
Exit Price: ${trade.exitPrice || 'Open'}
Quantity: ${trade.quantity}
Entry Date: ${trade.entryDate}
Exit Date: ${trade.exitDate || 'N/A'}
Profit/Loss: ${trade.profit || 'N/A'}
Notes: ${trade.notes || 'None'}
Confidence: ${trade.confidence || 'N/A'}
Mood: ${trade.mood || 'N/A'}
Strategy: ${trade.strategy || 'N/A'}

Please provide:
1. Trade analysis and performance assessment
2. Risk management evaluation
3. Specific recommendations for improvement
4. Pattern recognition and insights
5. Risk score (1-10) and confidence level (1-100)
    `;
  }

  private buildPortfolioAnalysisPrompt(trades: any[]): string {
    const totalTrades = trades.length;
    const winningTrades = trades.filter(t => t.profit && t.profit > 0).length;
    const losingTrades = trades.filter(t => t.profit && t.profit < 0).length;
    const totalProfit = trades.reduce((sum, t) => sum + (t.profit || 0), 0);
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

    return `
Analyze this trading portfolio and provide comprehensive insights:

Portfolio Summary:
- Total Trades: ${totalTrades}
- Winning Trades: ${winningTrades}
- Losing Trades: ${losingTrades}
- Win Rate: ${winRate.toFixed(2)}%
- Total Profit/Loss: $${totalProfit.toFixed(2)}

Recent Trades (last 10):
${trades.slice(0, 10).map(t => `- ${t.symbol}: ${t.type} @ $${t.entryPrice}, P&L: $${t.profit || 'Open'}`).join('\n')}

Please provide:
1. Overall portfolio performance assessment
2. Risk analysis and exposure evaluation
3. Strengths and weaknesses identification
4. Specific recommendations for improvement
5. Opportunities and threats analysis
6. Overall score (1-100) with detailed breakdown
    `;
  }

  private buildStrategyPrompt(symbol: string, timeframe: string): string {
    return `
Generate a comprehensive trading strategy for ${symbol} on ${timeframe} timeframe.

Please include:
1. Market analysis and current conditions
2. Entry and exit criteria
3. Risk management rules
4. Position sizing guidelines
5. Technical indicators to use
6. Potential scenarios and outcomes
7. Risk/reward assessment
8. Implementation steps
    `;
  }

  private buildMarketInsightsPrompt(symbols: string[]): string {
    return `
Provide market insights and analysis for the following symbols: ${symbols.join(', ')}

Please include:
1. Current market sentiment for each symbol
2. Key technical levels to watch
3. Potential catalysts or events
4. Risk factors and considerations
5. Trading opportunities and setups
6. Market correlations and relationships
    `;
  }

  private parseTradeAnalysis(content: string, tradeId: string): TradeAnalysis {
    // Parse AI response to extract structured data
    // This is a simplified implementation
    return {
      tradeId,
      analysis: content,
      recommendations: this.extractRecommendations(content),
      riskScore: this.extractRiskScore(content),
      confidence: this.extractConfidence(content),
      patterns: this.extractPatterns(content),
      improvements: this.extractImprovements(content)
    };
  }

  private parsePortfolioAnalysis(content: string): PortfolioAnalysis {
    return {
      overallScore: this.extractOverallScore(content),
      riskAssessment: this.extractRiskAssessment(content),
      recommendations: this.extractRecommendations(content),
      strengths: this.extractStrengths(content),
      weaknesses: this.extractWeaknesses(content),
      opportunities: this.extractOpportunities(content),
      threats: this.extractThreats(content)
    };
  }

  // Helper methods for parsing AI responses
  private extractRecommendations(content: string): string[] {
    const recommendations = content.match(/recommendations?[:\s]+([^.]+)/gi);
    return recommendations ? recommendations.map(r => r.replace(/recommendations?[:\s]+/i, '').trim()) : [];
  }

  private extractRiskScore(content: string): number {
    const match = content.match(/risk score[:\s]+(\d+)/i);
    return match ? parseInt(match[1]) : 5;
  }

  private extractConfidence(content: string): number {
    const match = content.match(/confidence[:\s]+(\d+)/i);
    return match ? parseInt(match[1]) : 50;
  }

  private extractPatterns(content: string): string[] {
    const patterns = content.match(/patterns?[:\s]+([^.]+)/gi);
    return patterns ? patterns.map(p => p.replace(/patterns?[:\s]+/i, '').trim()) : [];
  }

  private extractImprovements(content: string): string[] {
    const improvements = content.match(/improvements?[:\s]+([^.]+)/gi);
    return improvements ? improvements.map(i => i.replace(/improvements?[:\s]+/i, '').trim()) : [];
  }

  private extractOverallScore(content: string): number {
    const match = content.match(/overall score[:\s]+(\d+)/i);
    return match ? parseInt(match[1]) : 50;
  }

  private extractRiskAssessment(content: string): string {
    const match = content.match(/risk assessment[:\s]+([^.]+)/i);
    return match ? match[1].trim() : 'Moderate risk';
  }

  private extractStrengths(content: string): string[] {
    const strengths = content.match(/strengths?[:\s]+([^.]+)/gi);
    return strengths ? strengths.map(s => s.replace(/strengths?[:\s]+/i, '').trim()) : [];
  }

  private extractWeaknesses(content: string): string[] {
    const weaknesses = content.match(/weaknesses?[:\s]+([^.]+)/gi);
    return weaknesses ? weaknesses.map(w => w.replace(/weaknesses?[:\s]+/i, '').trim()) : [];
  }

  private extractOpportunities(content: string): string[] {
    const opportunities = content.match(/opportunities?[:\s]+([^.]+)/gi);
    return opportunities ? opportunities.map(o => o.replace(/opportunities?[:\s]+/i, '').trim()) : [];
  }

  private extractThreats(content: string): string[] {
    const threats = content.match(/threats?[:\s]+([^.]+)/gi);
    return threats ? threats.map(t => t.replace(/threats?[:\s]+/i, '').trim()) : [];
  }
}

// Default configuration with environment variables
const defaultConfig: AIStreamConfig = {
  providers: [
    {
      name: 'openai',
      apiKey: process.env.OPENAI_API_KEY || '',
      model: 'gpt-4'
    },
    {
      name: 'groq',
      apiKey: process.env.GROQ_API_KEY || '',
      model: 'llama3-8b-8192'
    },
    {
      name: 'gemini',
      apiKey: process.env.GEMINI_API_KEY || '',
      model: 'gemini-pro'
    }
  ],
  defaultProvider: 'openai',
  maxTokens: 2000,
  temperature: 0.7
};

export const aiStreamService = new AIStreamService(defaultConfig);
export default aiStreamService; 