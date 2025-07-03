import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import localDatabase, { Trade, WatchlistItem } from '../lib/localDatabase';
import { useUser } from '../contexts/UserContext';
import { TrendingUp, TrendingDown, BarChart3, Star, Brain, Plus, History, Eye, Layers, Settings as SettingsIcon } from 'lucide-react';

interface PortfolioStats {
  totalTrades: number;
  openTrades: number;
  closedTrades: number;
  netProfit: number;
  winRate: number;
  bestTrade?: Trade;
  worstTrade?: Trade;
}

const Dashboard: React.FC = () => {
  const { state: userState } = useUser();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [stats, setStats] = useState<PortfolioStats | null>(null);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      await localDatabase.initialize();
      const allTrades = await localDatabase.getTrades();
      const allWatchlist = await localDatabase.getWatchlist();
      setTrades(allTrades);
      setWatchlist(allWatchlist);
      setRecentTrades(allTrades.slice(-3).reverse());
      calculateStats(allTrades);
      generateAiSummary(allTrades);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (trades: Trade[]) => {
    const openTrades = trades.filter(t => !t.exitDate);
    const closedTrades = trades.filter(t => t.exitDate && t.profit !== undefined);
    const netProfit = closedTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
    const winningTrades = closedTrades.filter(t => t.profit && t.profit > 0);
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
    const bestTrade = closedTrades.reduce((best, t) => (t.profit && (!best || t.profit > (best.profit || 0))) ? t : best, undefined as Trade | undefined);
    const worstTrade = closedTrades.reduce((worst, t) => (t.profit && (!worst || t.profit < (worst.profit || 0))) ? t : worst, undefined as Trade | undefined);
    setStats({
      totalTrades: trades.length,
      openTrades: openTrades.length,
      closedTrades: closedTrades.length,
      netProfit,
      winRate,
      bestTrade,
      worstTrade
    });
  };

  const generateAiSummary = async (trades: Trade[]) => {
    // Simulate AI summary (replace with aiStreamService in real app)
    if (trades.length === 0) {
      setAiSummary('No trades yet. Start trading to see AI analysis!');
      return;
    }
    const profit = trades.reduce((sum, t) => sum + (t.profit || 0), 0);
    setAiSummary(
      `AI Summary: Your portfolio shows a ${profit >= 0 ? 'positive' : 'negative'} trend. ${trades.length} trades analyzed. Keep focusing on risk management and consistency!`
    );
  };

  if (isLoading) {
    return (
      <div className="px-4 pt-4 pb-24 min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-24 min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      {/* Portfolio Overview */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="bg-dark-800/70 rounded-xl p-4 shadow-glass backdrop-blur-xs border border-dark-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Net Profit</span>
            <span className={`text-lg font-bold ${stats && stats.netProfit >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
              {stats && stats.netProfit >= 0 ? '+' : ''}${stats?.netProfit.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>Total Trades</span>
            <span className="text-primary-400">{stats?.totalTrades}</span>
          </div>
        </div>
        <div className="bg-dark-800/70 rounded-xl p-4 shadow-glass backdrop-blur-xs border border-dark-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Win Rate</span>
            <span className="text-lg font-bold text-primary-400">{stats?.winRate.toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>Open Trades</span>
            <span className="text-success-400">{stats?.openTrades}</span>
          </div>
        </div>
      </div>

      {/* AI Portfolio Analysis */}
      <div className="mb-6 bg-dark-800/70 rounded-xl p-4 shadow-glass backdrop-blur-xs border border-dark-700">
        <div className="flex items-center mb-2">
          <Brain className="w-5 h-5 text-primary-400 mr-2" />
          <span className="text-lg font-semibold text-white">AI Portfolio Analysis</span>
        </div>
        <p className="text-gray-300 text-sm">{aiSummary}</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/add-trade')}
          className="bg-primary-500 hover:bg-primary-600 text-white rounded-xl p-4 flex flex-col items-center shadow-holographic transition-all duration-200 active:scale-95"
        >
          <Plus className="w-6 h-6 mb-1" />
          <span className="text-sm">Add Trade</span>
        </button>
        <button
          onClick={() => navigate('/live-trades')}
          className="bg-dark-800/70 hover:bg-dark-700 text-primary-400 rounded-xl p-4 flex flex-col items-center shadow-glass transition-all duration-200"
        >
          <TrendingUp className="w-6 h-6 mb-1" />
          <span className="text-sm">Live Trades</span>
        </button>
        <button
          onClick={() => navigate('/history')}
          className="bg-dark-800/70 hover:bg-dark-700 text-primary-400 rounded-xl p-4 flex flex-col items-center shadow-glass transition-all duration-200"
        >
          <History className="w-6 h-6 mb-1" />
          <span className="text-sm">History</span>
        </button>
        <button
          onClick={() => navigate('/settings')}
          className="bg-dark-800/70 hover:bg-dark-700 text-primary-400 rounded-xl p-4 flex flex-col items-center shadow-glass transition-all duration-200"
        >
          <SettingsIcon className="w-6 h-6 mb-1" />
          <span className="text-sm">Settings</span>
        </button>
      </div>

      {/* Recent Trades */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Trades</h2>
        <div className="space-y-4">
          {recentTrades.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No recent trades</p>
            </div>
          ) : (
            recentTrades.map(trade => (
              <div
                key={trade.id}
                className="bg-dark-800/70 rounded-xl p-4 shadow-glass backdrop-blur-xs border border-dark-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-primary-200 text-lg">{trade.symbol}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    trade.type === 'buy' ? 'bg-success-500/20 text-success-400' : 'bg-danger-500/20 text-danger-400'
                  }`}>
                    {trade.type.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Entry</span>
                  <span className="text-white">${trade.entryPrice}</span>
                  <span className="text-gray-400">Qty</span>
                  <span className="text-white">{trade.quantity}</span>
                  <span className="text-gray-400">{trade.exitDate ? 'Closed' : 'Open'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Watchlist Highlights */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Watchlist Highlights</h2>
        <div className="space-y-4">
          {watchlist.length === 0 ? (
            <div className="text-center py-8">
              <Star className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No watchlist items</p>
            </div>
          ) : (
            watchlist.slice(0, 3).map(item => (
              <div
                key={item.symbol}
                className="bg-dark-800/70 rounded-xl p-4 shadow-glass backdrop-blur-xs border border-dark-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-primary-200 text-lg">{item.symbol}</span>
                  <span className="text-gray-400 text-sm">{item.name || 'Loading...'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Price</span>
                  <span className="text-white">${item.currentPrice?.toFixed(2) || 'N/A'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 