import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { localDatabase, Trade } from '../lib/localDatabase';
import { realDataService, PriceData } from '../lib/realDataService';
import { aiStreamService, PortfolioAnalysis } from '../lib/aiStreamService';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Activity, 
  BarChart3,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Eye,
  Settings
} from 'lucide-react';

interface DashboardStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalProfit: number;
  totalLoss: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  maxDrawdown: number;
  sharpeRatio: number;
  expectedValue: number;
}

interface RecentActivity {
  type: 'trade' | 'alert' | 'news';
  title: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'warning' | 'error';
}

const Dashboard: React.FC = () => {
  const { state: userState } = useUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [watchlist, setWatchlist] = useState<PriceData[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [portfolioAnalysis, setPortfolioAnalysis] = useState<PortfolioAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Initialize database
      await localDatabase.initialize();
      
      // Load trades and calculate stats
      const trades = await localDatabase.getTrades({ limit: 100 });
      const calculatedStats = calculateStats(trades);
      setStats(calculatedStats);
      
      // Set recent trades
      setRecentTrades(trades.slice(0, 5));
      
      // Load watchlist
      const watchlistItems = await localDatabase.getWatchlist();
      const watchlistPrices = await Promise.all(
        watchlistItems.slice(0, 5).map(item => 
          realDataService.getRealTimePrice(item.symbol).catch(() => null)
        )
      );
      setWatchlist(watchlistPrices.filter(Boolean) as PriceData[]);
      
      // Generate AI portfolio analysis
      if (trades.length > 0) {
        const analysis = await aiStreamService.analyzePortfolio(trades);
        setPortfolioAnalysis(analysis);
      }
      
      // Generate recent activity
      const activity = generateRecentActivity(trades);
      setRecentActivity(activity);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (trades: Trade[]): DashboardStats => {
    const totalTrades = trades.length;
    const winningTrades = trades.filter(t => t.profit && t.profit > 0).length;
    const losingTrades = trades.filter(t => t.profit && t.profit < 0).length;
    const totalProfit = trades.reduce((sum, t) => sum + (t.profit || 0), 0);
    const totalLoss = trades.reduce((sum, t) => sum + (Math.min(t.profit || 0, 0)), 0);
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    const profitFactor = Math.abs(totalLoss) > 0 ? Math.abs(totalProfit / totalLoss) : 0;
    
    const winningTradesList = trades.filter(t => t.profit && t.profit > 0);
    const losingTradesList = trades.filter(t => t.profit && t.profit < 0);
    
    const averageWin = winningTradesList.length > 0 
      ? winningTradesList.reduce((sum, t) => sum + (t.profit || 0), 0) / winningTradesList.length 
      : 0;
    
    const averageLoss = losingTradesList.length > 0 
      ? losingTradesList.reduce((sum, t) => sum + (t.profit || 0), 0) / losingTradesList.length 
      : 0;

    // Calculate max drawdown
    let maxDrawdown = 0;
    let peak = 0;
    let runningTotal = 0;
    
    trades.forEach(trade => {
      runningTotal += trade.profit || 0;
      if (runningTotal > peak) {
        peak = runningTotal;
      }
      const drawdown = peak - runningTotal;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });

    // Calculate Sharpe ratio (simplified)
    const returns = trades.map(t => t.profit || 0);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const sharpeRatio = variance > 0 ? avgReturn / Math.sqrt(variance) : 0;

    // Calculate expected value
    const expectedValue = (winRate / 100) * averageWin + ((100 - winRate) / 100) * averageLoss;

    return {
      totalTrades,
      winningTrades,
      losingTrades,
      winRate,
      totalProfit,
      totalLoss,
      profitFactor,
      averageWin,
      averageLoss,
      maxDrawdown,
      sharpeRatio,
      expectedValue
    };
  };

  const generateRecentActivity = (trades: Trade[]): RecentActivity[] => {
    const activity: RecentActivity[] = [];
    
    // Add recent trades
    trades.slice(0, 3).forEach(trade => {
      activity.push({
        type: 'trade',
        title: `${trade.type.toUpperCase()} ${trade.symbol}`,
        description: `${trade.quantity} @ $${trade.entryPrice}`,
        timestamp: trade.entryDate,
        status: trade.profit && trade.profit > 0 ? 'success' : 'error'
      });
    });

    // Add sample alerts and news
    activity.push({
      type: 'alert',
      title: 'Price Alert: BTC/USD',
      description: 'Bitcoin reached $50,000',
      timestamp: new Date().toISOString(),
      status: 'warning'
    });

    activity.push({
      type: 'news',
      title: 'Market Update',
      description: 'Fed announces interest rate decision',
      timestamp: new Date().toISOString(),
      status: 'success'
    });

    return activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: userState.preferences.defaultCurrency
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  const getStatusIcon = (status?: 'success' | 'warning' | 'error') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white">
      {/* Header */}
      <div className="bg-dark-800/50 backdrop-blur-lg border-b border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                TradeNote Dashboard
              </h1>
              <p className="text-gray-400 text-sm">
                Welcome back, {userState.user?.name || 'Trader'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors">
                <Eye className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-dark-800/50 backdrop-blur-lg rounded-xl p-6 border border-dark-700 hover:border-primary-500/50 transition-all duration-300 hover:shadow-holographic">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total P&L</p>
                <p className={`text-2xl font-bold ${stats?.totalProfit && stats.totalProfit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stats ? formatCurrency(stats.totalProfit) : '$0.00'}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stats?.totalProfit && stats.totalProfit > 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                {stats?.totalProfit && stats.totalProfit > 0 ? (
                  <TrendingUp className="w-6 h-6 text-green-400" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-400" />
                )}
              </div>
            </div>
          </div>

          <div className="bg-dark-800/50 backdrop-blur-lg rounded-xl p-6 border border-dark-700 hover:border-primary-500/50 transition-all duration-300 hover:shadow-holographic">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Win Rate</p>
                <p className="text-2xl font-bold text-primary-400">
                  {stats ? formatPercentage(stats.winRate) : '0%'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-primary-500/20">
                <Target className="w-6 h-6 text-primary-400" />
              </div>
            </div>
          </div>

          <div className="bg-dark-800/50 backdrop-blur-lg rounded-xl p-6 border border-dark-700 hover:border-primary-500/50 transition-all duration-300 hover:shadow-holographic">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Trades</p>
                <p className="text-2xl font-bold text-white">
                  {stats?.totalTrades || 0}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/20">
                <BarChart3 className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-dark-800/50 backdrop-blur-lg rounded-xl p-6 border border-dark-700 hover:border-primary-500/50 transition-all duration-300 hover:shadow-holographic">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Profit Factor</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {stats ? stats.profitFactor.toFixed(2) : '0.00'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-500/20">
                <DollarSign className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Trades */}
          <div className="lg:col-span-2">
            <div className="bg-dark-800/50 backdrop-blur-lg rounded-xl p-6 border border-dark-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Recent Trades</h2>
                <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />
                  <span>Add Trade</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {recentTrades.map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg border border-dark-600">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${trade.type === 'buy' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                        {trade.type === 'buy' ? (
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">{trade.symbol}</p>
                        <p className="text-sm text-gray-400">
                          {trade.quantity} @ {formatCurrency(trade.entryPrice)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${trade.profit && trade.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {trade.profit ? formatCurrency(trade.profit) : 'Open'}
                      </p>
                      <p className="text-sm text-gray-400">
                        {new Date(trade.entryDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Watchlist & Activity */}
          <div className="space-y-6">
            {/* Watchlist */}
            <div className="bg-dark-800/50 backdrop-blur-lg rounded-xl p-6 border border-dark-700">
              <h2 className="text-xl font-semibold text-white mb-4">Watchlist</h2>
              <div className="space-y-3">
                {watchlist.map((item) => (
                  <div key={item.symbol} className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg">
                    <div>
                      <p className="font-medium text-white">{item.symbol}</p>
                      <p className="text-sm text-gray-400">{formatCurrency(item.price)}</p>
                    </div>
                    <div className={`text-right ${item.changePercent > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      <p className="text-sm font-medium">
                        {item.changePercent > 0 ? '+' : ''}{formatPercentage(item.changePercent)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatCurrency(item.change)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-dark-800/50 backdrop-blur-lg rounded-xl p-6 border border-dark-700">
              <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-dark-700/50 rounded-lg">
                    {getStatusIcon(activity.status)}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{activity.title}</p>
                      <p className="text-xs text-gray-400">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Portfolio Analysis */}
        {portfolioAnalysis && (
          <div className="mt-8 bg-dark-800/50 backdrop-blur-lg rounded-xl p-6 border border-dark-700">
            <h2 className="text-xl font-semibold text-white mb-4">AI Portfolio Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-400 mb-2">
                  {portfolioAnalysis.overallScore}/100
                </div>
                <p className="text-sm text-gray-400">Overall Score</p>
              </div>
              <div>
                <h3 className="font-medium text-white mb-2">Risk Assessment</h3>
                <p className="text-sm text-gray-400">{portfolioAnalysis.riskAssessment}</p>
              </div>
              <div>
                <h3 className="font-medium text-white mb-2">Top Recommendations</h3>
                <ul className="text-sm text-gray-400 space-y-1">
                  {portfolioAnalysis.recommendations.slice(0, 2).map((rec, index) => (
                    <li key={index}>• {rec}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-white mb-2">Key Strengths</h3>
                <ul className="text-sm text-gray-400 space-y-1">
                  {portfolioAnalysis.strengths.slice(0, 2).map((strength, index) => (
                    <li key={index}>• {strength}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 