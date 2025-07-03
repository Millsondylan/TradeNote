import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import localDatabase, { WatchlistItem as WatchlistItemType } from '../lib/localDatabase';
import { useUser } from '../contexts/UserContext';
import { Plus, TrendingUp, TrendingDown, Star, Trash2, Search, Filter } from 'lucide-react';

interface WatchlistItem extends WatchlistItemType {
  changeColor?: string;
  isPositive?: boolean;
}

const Watchlist: React.FC = () => {
  const { state: userState } = useUser();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [filteredWatchlist, setFilteredWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');
  const [sortBy, setSortBy] = useState<'symbol' | 'change' | 'price'>('symbol');
  const navigate = useNavigate();

  useEffect(() => {
    loadWatchlist();
    // Refresh prices every 30 seconds
    const interval = setInterval(loadWatchlist, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterAndSortWatchlist();
  }, [watchlist, searchTerm, sortBy]);

  const loadWatchlist = async () => {
    try {
      await localDatabase.initialize();
      const items = await localDatabase.getWatchlist();
      
      // Simulate real-time price updates
      const itemsWithPrices = items.map(item => {
        const priceChange = (Math.random() - 0.5) * 0.05; // Simulate price movement
        const currentPrice = (item.currentPrice || 100) * (1 + priceChange);
        const change = currentPrice - (item.currentPrice || 100);
        const changePercent = (change / (item.currentPrice || 100)) * 100;
        
        return {
          ...item,
          currentPrice,
          change,
          changePercent,
          changeColor: change >= 0 ? 'text-success-400' : 'text-danger-400',
          isPositive: change >= 0
        };
      });
      
      setWatchlist(itemsWithPrices);
    } catch (error) {
      console.error('Error loading watchlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortWatchlist = () => {
    let filtered = [...watchlist];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'symbol':
          return a.symbol.localeCompare(b.symbol);
        case 'change':
          return (b.changePercent || 0) - (a.changePercent || 0);
        case 'price':
          return (b.currentPrice || 0) - (a.currentPrice || 0);
        default:
          return 0;
      }
    });

    setFilteredWatchlist(filtered);
  };

  const addToWatchlist = async () => {
    if (!newSymbol.trim()) return;

    try {
      const symbol = newSymbol.trim().toUpperCase();
      
      // Check if already in watchlist
      const existing = watchlist.find(item => item.symbol === symbol);
      if (existing) {
        alert('Symbol already in watchlist');
        return;
      }

      const newItem: WatchlistItemType = {
        symbol,
        name: symbol, // In real app, fetch company name from API
        currentPrice: Math.random() * 1000 + 10, // Simulate price
        change: 0,
        changePercent: 0,
        addedAt: new Date().toISOString()
      };

      await localDatabase.addToWatchlist(newItem);
      setNewSymbol('');
      setShowAddForm(false);
      await loadWatchlist();
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      alert('Failed to add symbol to watchlist');
    }
  };

  const removeFromWatchlist = async (symbol: string) => {
    try {
      await localDatabase.removeFromWatchlist(symbol);
      await loadWatchlist();
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      alert('Failed to remove symbol from watchlist');
    }
  };

  const quickTrade = (symbol: string) => {
    navigate('/add-trade', { state: { symbol } });
  };

  if (isLoading) {
    return (
      <div className="px-4 pt-4 pb-24 min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading watchlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-24 min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-primary-300 drop-shadow-glow">Watchlist</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-primary-500 hover:bg-primary-600 text-white rounded-full px-4 py-2 shadow-holographic transition-all duration-200 active:scale-95"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search symbols..."
            className="w-full pl-10 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400 text-sm">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'symbol' | 'change' | 'price')}
            className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-1 text-white text-sm"
          >
            <option value="symbol">Symbol</option>
            <option value="change">Change %</option>
            <option value="price">Price</option>
          </select>
        </div>
      </div>

      {/* Add Symbol Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-dark-800 rounded-xl p-6 w-full max-w-md shadow-glass backdrop-blur-xs border border-dark-700">
            <h2 className="text-xl font-bold text-white mb-4">Add to Watchlist</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">Symbol</label>
              <input
                type="text"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                placeholder="Enter stock symbol (e.g., AAPL)"
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                onKeyPress={(e) => e.key === 'Enter' && addToWatchlist()}
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewSymbol('');
                }}
                className="flex-1 bg-dark-700 hover:bg-dark-600 text-white py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addToWatchlist}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg transition-colors"
              >
                Add Symbol
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Watchlist Items */}
      <div className="space-y-4">
        {filteredWatchlist.length === 0 ? (
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              {watchlist.length === 0 ? 'No Watchlist Items' : 'No Matching Symbols'}
            </h3>
            <p className="text-gray-500 mb-4">
              {watchlist.length === 0 
                ? 'Add your first symbol to start tracking' 
                : 'Try adjusting your search or filters'
              }
            </p>
            {watchlist.length === 0 && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Add First Symbol
              </button>
            )}
          </div>
        ) : (
          filteredWatchlist.map(item => (
            <div
              key={item.symbol}
              className="bg-dark-800/70 rounded-xl p-4 shadow-glass backdrop-blur-xs border border-dark-700"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="text-primary-400">
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg">{item.symbol}</h3>
                    <p className="text-gray-400 text-sm">{item.name || 'Loading...'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {item.isPositive ? (
                    <TrendingUp className="w-4 h-4 text-success-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-danger-400" />
                  )}
                  <span className={`text-sm font-bold ${item.changeColor}`}>
                    {item.changePercent && item.changePercent >= 0 ? '+' : ''}{item.changePercent?.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Current Price</span>
                    <span className="text-white font-medium">${item.currentPrice?.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Change</span>
                    <span className={`font-medium ${item.changeColor}`}>
                      {item.change && item.change >= 0 ? '+' : ''}${item.change?.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Added</span>
                    <span className="text-white">
                      {new Date(item.addedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Status</span>
                    <span className="text-success-400">Active</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => quickTrade(item.symbol)}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 px-3 rounded-lg text-sm transition-colors"
                >
                  Quick Trade
                </button>
                <button
                  onClick={() => removeFromWatchlist(item.symbol)}
                  className="bg-danger-500 hover:bg-danger-600 text-white py-2 px-3 rounded-lg text-sm transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Watchlist; 