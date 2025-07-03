import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import localDatabase, { Trade as TradeType } from '../lib/localDatabase';
import { useUser } from '../contexts/UserContext';
import { TrendingUp, TrendingDown, Clock, DollarSign, Target, X } from 'lucide-react';

interface LiveTrade extends TradeType {
  currentPrice?: number;
  unrealizedPnL?: number;
  pnlPercent?: number;
}

const LiveTrades: React.FC = () => {
  const { state: userState } = useUser();
  const [liveTrades, setLiveTrades] = useState<LiveTrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadLiveTrades();
    // Refresh every 30 seconds for live updates
    const interval = setInterval(loadLiveTrades, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadLiveTrades = async () => {
    try {
      await localDatabase.initialize();
      const allTrades = await localDatabase.getTrades();
      
      // Filter for open trades (no exit date)
      const openTrades = allTrades.filter(trade => !trade.exitDate);
      
      // Simulate current prices and calculate unrealized P&L
      const tradesWithPrices = openTrades.map(trade => {
        const priceChange = (Math.random() - 0.5) * 0.1; // Simulate price movement
        const currentPrice = trade.entryPrice * (1 + priceChange);
        const unrealizedPnL = (currentPrice - trade.entryPrice) * trade.quantity;
        const pnlPercent = ((currentPrice - trade.entryPrice) / trade.entryPrice) * 100;
        
        return {
          ...trade,
          currentPrice,
          unrealizedPnL,
          pnlPercent
        };
      });
      
      setLiveTrades(tradesWithPrices);
    } catch (error) {
      console.error('Error loading live trades:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const closeTrade = async (tradeId: string, exitPrice: number) => {
    try {
      const trade = liveTrades.find(t => t.id === tradeId);
      if (!trade) return;

      const profit = (exitPrice - trade.entryPrice) * trade.quantity;
      
      const updatedTrade = {
        ...trade,
        exitPrice,
        exitDate: new Date().toISOString(),
        profit,
        updatedAt: new Date().toISOString()
      };

      await localDatabase.updateTrade(updatedTrade);
      await loadLiveTrades(); // Refresh the list
    } catch (error) {
      console.error('Error closing trade:', error);
      alert('Failed to close trade');
    }
  };

  const getTotalUnrealizedPnL = () => {
    return liveTrades.reduce((total, trade) => total + (trade.unrealizedPnL || 0), 0);
  };

  if (isLoading) {
    return (
      <div className="px-4 pt-4 pb-24 min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading live trades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-24 min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-primary-300 drop-shadow-glow">Live Trades</h1>
        <button
          className="bg-primary-500 hover:bg-primary-600 text-white rounded-full px-4 py-2 shadow-holographic transition-all duration-200 active:scale-95"
          onClick={() => navigate('/add-trade')}
        >
          + New Trade
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-dark-800/70 rounded-xl p-4 mb-6 shadow-glass backdrop-blur-xs border border-dark-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">Total Unrealized P&L</span>
          <span className={`text-lg font-bold ${getTotalUnrealizedPnL() >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
            {getTotalUnrealizedPnL() >= 0 ? '+' : ''}${getTotalUnrealizedPnL().toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>{liveTrades.length} Open Trades</span>
          <span className="text-primary-400">Live Updates</span>
        </div>
      </div>

      {/* Live Trades List */}
      <div className="space-y-4">
        {liveTrades.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Open Trades</h3>
            <p className="text-gray-500 mb-4">Start your first trade to see it here</p>
            <button
              onClick={() => navigate('/add-trade')}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Add Your First Trade
            </button>
          </div>
        ) : (
          liveTrades.map(trade => (
            <div
              key={trade.id}
              className="bg-dark-800/70 rounded-xl p-4 shadow-glass backdrop-blur-xs border border-dark-700"
            >
              {/* Trade Header */}
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
                  {trade.unrealizedPnL && trade.unrealizedPnL >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-success-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-danger-400" />
                  )}
                  <span className={`text-sm font-bold ${trade.unrealizedPnL && trade.unrealizedPnL >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
                    {trade.unrealizedPnL && trade.unrealizedPnL >= 0 ? '+' : ''}${trade.unrealizedPnL?.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Trade Details */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Entry Price</span>
                    <span className="text-white">${trade.entryPrice}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Current Price</span>
                    <span className="text-primary-300">${trade.currentPrice?.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Quantity</span>
                    <span className="text-white">{trade.quantity}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">P&L %</span>
                    <span className={`font-medium ${trade.pnlPercent && trade.pnlPercent >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
                      {trade.pnlPercent && trade.pnlPercent >= 0 ? '+' : ''}{trade.pnlPercent?.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Duration</span>
                    <span className="text-white">
                      {Math.floor((Date.now() - new Date(trade.entryDate).getTime()) / (1000 * 60 * 60 * 24))}d
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Strategy</span>
                    <span className="text-white">{trade.strategy || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate(`/journal/${trade.id}`)}
                  className="flex-1 bg-dark-700 hover:bg-dark-600 text-white py-2 px-3 rounded-lg text-sm transition-colors"
                >
                  View Details
                </button>
                <button
                  onClick={() => {
                    const exitPrice = prompt('Enter exit price:');
                    if (exitPrice && !isNaN(Number(exitPrice))) {
                      closeTrade(trade.id!, Number(exitPrice));
                    }
                  }}
                  className="bg-danger-500 hover:bg-danger-600 text-white py-2 px-3 rounded-lg text-sm transition-colors"
                >
                  Close Trade
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LiveTrades; 