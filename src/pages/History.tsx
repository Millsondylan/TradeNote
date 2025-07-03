import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import localDatabase, { Trade as TradeType } from '../lib/localDatabase';
import { useUser } from '../contexts/UserContext';
import { Calendar, Filter, TrendingUp, TrendingDown, BarChart3, DollarSign, Clock } from 'lucide-react';

interface TradeStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalProfit: number;
  totalLoss: number;
  netProfit: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  largestWin: number;
  largestLoss: number;
}

const History: React.FC = () => {
  const { state: userState } = useUser();
  const [closedTrades, setClosedTrades] = useState<TradeType[]>([]);
  const [filteredTrades, setFilteredTrades] = useState<TradeType[]>([]);
  const [stats, setStats] = useState<TradeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    symbol: '',
    type: '',
    startDate: '',
    endDate: '',
    minProfit: '',
    maxProfit: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [closedTrades, filters]);

  const loadHistory = async () => {
    try {
      await localDatabase.initialize();
      const allTrades = await localDatabase.getTrades();
      
      // Filter for closed trades (have exit date)
      const closed = allTrades.filter(trade => trade.exitDate && trade.profit !== undefined);
      setClosedTrades(closed);
      
      // Calculate statistics
      calculateStats(closed);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (trades: TradeType[]) => {
    const winningTrades = trades.filter(t => t.profit && t.profit > 0);
    const losingTrades = trades.filter(t => t.profit && t.profit < 0);
    
    const totalProfit = winningTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
    const totalLoss = Math.abs(losingTrades.reduce((sum, t) => sum + (t.profit || 0), 0));
    const netProfit = trades.reduce((sum, t) => sum + (t.profit || 0), 0);
    
    const stats: TradeStats = {
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0,
      totalProfit,
      totalLoss,
      netProfit,
      averageWin: winningTrades.length > 0 ? totalProfit / winningTrades.length : 0,
      averageLoss: losingTrades.length > 0 ? totalLoss / losingTrades.length : 0,
      profitFactor: totalLoss > 0 ? totalProfit / totalLoss : 0,
      largestWin: Math.max(...trades.map(t => t.profit || 0)),
      largestLoss: Math.min(...trades.map(t => t.profit || 0))
    };
    
    setStats(stats);
  };

  const applyFilters = () => {
    let filtered = [...closedTrades];

    if (filters.symbol) {
      filtered = filtered.filter(trade => 
        trade.symbol.toLowerCase().includes(filters.symbol.toLowerCase())
      );
    }

    if (filters.type) {
      filtered = filtered.filter(trade => trade.type === filters.type);
    }

    if (filters.startDate) {
      filtered = filtered.filter(trade => trade.entryDate >= filters.startDate);
    }

    if (filters.endDate) {
      filtered = filtered.filter(trade => trade.entryDate <= filters.endDate);
    }

    if (filters.minProfit) {
      filtered = filtered.filter(trade => (trade.profit || 0) >= Number(filters.minProfit));
    }

    if (filters.maxProfit) {
      filtered = filtered.filter(trade => (trade.profit || 0) <= Number(filters.maxProfit));
    }

    setFilteredTrades(filtered);
  };

  const clearFilters = () => {
    setFilters({
      symbol: '',
      type: '',
      startDate: '',
      endDate: '',
      minProfit: '',
      maxProfit: ''
    });
  };

  if (isLoading) {
    return (
      <div className="px-4 pt-4 pb-24 min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading trading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-24 min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-primary-300 drop-shadow-glow">Trading History</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-dark-700 hover:bg-dark-600 text-white rounded-full p-2 shadow-glass transition-all duration-200"
        >
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-dark-800/70 rounded-xl p-4 mb-6 shadow-glass backdrop-blur-xs border border-dark-700">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Symbol</label>
              <input
                type="text"
                value={filters.symbol}
                onChange={(e) => setFilters(prev => ({ ...prev, symbol: e.target.value }))}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm"
                placeholder="Filter by symbol"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm"
              >
                <option value="">All Types</option>
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Min Profit</label>
              <input
                type="number"
                value={filters.minProfit}
                onChange={(e) => setFilters(prev => ({ ...prev, minProfit: e.target.value }))}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm"
                placeholder="Min profit"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Max Profit</label>
              <input
                type="number"
                value={filters.maxProfit}
                onChange={(e) => setFilters(prev => ({ ...prev, maxProfit: e.target.value }))}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm"
                placeholder="Max profit"
              />
            </div>
          </div>
          <div className="flex justify-between mt-4">
            <button
              onClick={clearFilters}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Clear Filters
            </button>
            <span className="text-sm text-gray-400">
              {filteredTrades.length} of {closedTrades.length} trades
            </span>
          </div>
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-dark-800/70 rounded-xl p-4 shadow-glass backdrop-blur-xs border border-dark-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Net Profit</span>
              <span className={`text-lg font-bold ${stats.netProfit >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
                {stats.netProfit >= 0 ? '+' : ''}${stats.netProfit.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>Win Rate</span>
              <span className="text-primary-400">{stats.winRate.toFixed(1)}%</span>
            </div>
          </div>

          <div className="bg-dark-800/70 rounded-xl p-4 shadow-glass backdrop-blur-xs border border-dark-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Trades</span>
              <span className="text-lg font-bold text-white">{stats.totalTrades}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>Profit Factor</span>
              <span className="text-primary-400">{stats.profitFactor.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Trades List */}
      <div className="space-y-4">
        {filteredTrades.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Trades Found</h3>
            <p className="text-gray-500 mb-4">
              {closedTrades.length === 0 ? 'Complete your first trade to see it here' : 'No trades match your filters'}
            </p>
            {closedTrades.length === 0 && (
              <button
                onClick={() => navigate('/add-trade')}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Add Your First Trade
              </button>
            )}
          </div>
        ) : (
          filteredTrades.map(trade => (
            <div
              key={trade.id}
              className="bg-dark-800/70 rounded-xl p-4 shadow-glass backdrop-blur-xs border border-dark-700"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="font-semibold text-primary-200 text-lg">{trade.symbol}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    trade.type === 'buy' ? 'bg-success-500/20 text-success-400' : 'bg-danger-500/20 text-danger-400'
                  }`}>
                    {trade.type.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {trade.profit && trade.profit >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-success-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-danger-400" />
                  )}
                  <span className={`text-sm font-bold ${trade.profit && trade.profit >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
                    {trade.profit && trade.profit >= 0 ? '+' : ''}${trade.profit?.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Entry</span>
                    <span className="text-white">${trade.entryPrice}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Exit</span>
                    <span className="text-white">${trade.exitPrice}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Quantity</span>
                    <span className="text-white">{trade.quantity}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Duration</span>
                    <span className="text-white">
                      {Math.floor((new Date(trade.exitDate!).getTime() - new Date(trade.entryDate).getTime()) / (1000 * 60 * 60 * 24))}d
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => navigate(`/journal/${trade.id}`)}
                  className="text-primary-400 hover:text-primary-300 text-sm transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History; 