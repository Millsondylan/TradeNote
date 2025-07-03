import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import localDatabase, { Trade } from '../lib/localDatabase';
import { useUser } from '../contexts/UserContext';
import { Search, Filter, TrendingUp, TrendingDown, Edit, Plus } from 'lucide-react';

const Journal: React.FC = () => {
  const { state: userState } = useUser();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [filteredTrades, setFilteredTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'symbol' | 'profit'>('date');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    minProfit: '',
    maxProfit: '',
    startDate: '',
    endDate: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadTrades();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [trades, searchTerm, sortBy, filters]);

  const loadTrades = async () => {
    setIsLoading(true);
    try {
      await localDatabase.initialize();
      const allTrades = await localDatabase.getTrades();
      setTrades(allTrades);
    } catch (error) {
      console.error('Error loading trades:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...trades];
    if (searchTerm) {
      filtered = filtered.filter(trade =>
        trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (trade.notes && trade.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (filters.type) {
      filtered = filtered.filter(trade => trade.type === filters.type);
    }
    if (filters.minProfit) {
      filtered = filtered.filter(trade => (trade.profit || 0) >= Number(filters.minProfit));
    }
    if (filters.maxProfit) {
      filtered = filtered.filter(trade => (trade.profit || 0) <= Number(filters.maxProfit));
    }
    if (filters.startDate) {
      filtered = filtered.filter(trade => trade.entryDate >= filters.startDate);
    }
    if (filters.endDate) {
      filtered = filtered.filter(trade => trade.entryDate <= filters.endDate);
    }
    switch (sortBy) {
      case 'date':
        filtered.sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());
        break;
      case 'symbol':
        filtered.sort((a, b) => a.symbol.localeCompare(b.symbol));
        break;
      case 'profit':
        filtered.sort((a, b) => (b.profit || 0) - (a.profit || 0));
        break;
    }
    setFilteredTrades(filtered);
  };

  const clearFilters = () => {
    setFilters({ type: '', minProfit: '', maxProfit: '', startDate: '', endDate: '' });
  };

  if (isLoading) {
    return (
      <div className="px-4 pt-4 pb-24 min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading trades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-24 min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-primary-300 drop-shadow-glow">Trade Journal</h1>
        <button
          onClick={() => navigate('/add-trade')}
          className="bg-primary-500 hover:bg-primary-600 text-white rounded-full px-4 py-2 shadow-holographic transition-all duration-200 active:scale-95"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Search and Sort */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search trades..."
            className="w-full pl-10 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400 text-sm">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'symbol' | 'profit')}
            className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-1 text-white text-sm"
          >
            <option value="date">Date</option>
            <option value="symbol">Symbol</option>
            <option value="profit">Profit</option>
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="ml-2 bg-dark-700 hover:bg-dark-600 text-white rounded-full p-2 shadow-glass transition-all duration-200"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-dark-800/70 rounded-xl p-4 mb-6 shadow-glass backdrop-blur-xs border border-dark-700">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm"
              >
                <option value="">All</option>
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
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
          </div>
          <div className="flex justify-between mt-4">
            <button
              onClick={clearFilters}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Clear Filters
            </button>
            <span className="text-sm text-gray-400">
              {filteredTrades.length} of {trades.length} trades
            </span>
          </div>
        </div>
      )}

      {/* Trades List */}
      <div className="space-y-4">
        {filteredTrades.length === 0 ? (
          <div className="text-center py-12">
            <Edit className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Trades Found</h3>
            <p className="text-gray-500 mb-4">
              {trades.length === 0 ? 'Add your first trade to get started' : 'No trades match your filters'}
            </p>
            {trades.length === 0 && (
              <button
                onClick={() => navigate('/add-trade')}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Add First Trade
              </button>
            )}
          </div>
        ) : (
          filteredTrades.map(trade => (
            <div
              key={trade.id}
              className="bg-dark-800/70 rounded-xl p-4 shadow-glass backdrop-blur-xs border border-dark-700 cursor-pointer hover:border-primary-500/50 transition-colors"
              onClick={() => navigate(`/journal/${trade.id}`)}
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
                <span className={`font-bold ${trade.profit && trade.profit >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
                  {trade.profit && trade.profit >= 0 ? '+' : ''}${trade.profit?.toFixed(2) || 'N/A'}
                </span>
              </div>
              {trade.notes && (
                <div className="mt-2 text-gray-400 text-xs italic truncate">{trade.notes}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Journal; 