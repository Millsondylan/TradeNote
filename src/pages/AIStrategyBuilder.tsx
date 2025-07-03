import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Brain, Play, Save, Settings, TrendingUp, Target, Zap, BookOpen, Loader } from 'lucide-react';

interface Strategy {
  id: string;
  name: string;
  description: string;
  type: 'trend-following' | 'mean-reversion' | 'breakout' | 'scalping' | 'swing';
  riskLevel: 'low' | 'medium' | 'high';
  entryRules: string[];
  exitRules: string[];
  stopLoss: number;
  takeProfit: number;
  backtestResults?: {
    totalTrades: number;
    winRate: number;
    profitFactor: number;
    maxDrawdown: number;
    totalReturn: number;
  };
}

const AIStrategyBuilder: React.FC = () => {
  const { state: userState } = useUser();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [currentStrategy, setCurrentStrategy] = useState<Strategy | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isBacktesting, setIsBacktesting] = useState(false);
  const navigate = useNavigate();

  const strategyTemplates: Strategy[] = [
    {
      id: '1',
      name: 'Moving Average Crossover',
      description: 'Buy when short MA crosses above long MA, sell when it crosses below',
      type: 'trend-following',
      riskLevel: 'medium',
      entryRules: ['Short MA > Long MA', 'Volume > Average Volume', 'Price above 200 SMA'],
      exitRules: ['Short MA < Long MA', 'Stop loss hit', 'Take profit reached'],
      stopLoss: 2,
      takeProfit: 6
    },
    {
      id: '2',
      name: 'RSI Mean Reversion',
      description: 'Buy oversold conditions, sell overbought conditions',
      type: 'mean-reversion',
      riskLevel: 'low',
      entryRules: ['RSI < 30', 'Price near support', 'Volume confirmation'],
      exitRules: ['RSI > 70', 'Stop loss hit', 'Take profit reached'],
      stopLoss: 1.5,
      takeProfit: 4.5
    },
    {
      id: '3',
      name: 'Breakout Strategy',
      description: 'Trade breakouts from key resistance/support levels',
      type: 'breakout',
      riskLevel: 'high',
      entryRules: ['Price breaks resistance', 'Volume spike', 'Retest of breakout level'],
      exitRules: ['Price returns to breakout level', 'Stop loss hit', 'Take profit reached'],
      stopLoss: 3,
      takeProfit: 9
    }
  ];

  const createNewStrategy = () => {
    const newStrategy: Strategy = {
      id: Date.now().toString(),
      name: '',
      description: '',
      type: 'trend-following',
      riskLevel: 'medium',
      entryRules: [''],
      exitRules: [''],
      stopLoss: 2,
      takeProfit: 6
    };
    setCurrentStrategy(newStrategy);
    setIsCreating(true);
  };

  const saveStrategy = () => {
    if (!currentStrategy || !currentStrategy.name.trim()) {
      alert('Please enter a strategy name');
      return;
    }

    setStrategies(prev => {
      const existing = prev.find(s => s.id === currentStrategy.id);
      if (existing) {
        return prev.map(s => s.id === currentStrategy.id ? currentStrategy : s);
      } else {
        return [...prev, currentStrategy];
      }
    });

    setIsCreating(false);
    setCurrentStrategy(null);
  };

  const backtestStrategy = async (strategy: Strategy) => {
    setIsBacktesting(true);
    
    // Simulate backtesting
    setTimeout(() => {
      const mockResults = {
        totalTrades: Math.floor(Math.random() * 50) + 10,
        winRate: Math.random() * 40 + 40, // 40-80%
        profitFactor: Math.random() * 2 + 0.5, // 0.5-2.5
        maxDrawdown: Math.random() * 15 + 5, // 5-20%
        totalReturn: Math.random() * 100 - 20 // -20% to +80%
      };

      const updatedStrategy = { ...strategy, backtestResults: mockResults };
      setStrategies(prev => prev.map(s => s.id === strategy.id ? updatedStrategy : s));
      setIsBacktesting(false);
    }, 2000);
  };

  const getRiskColor = (risk: Strategy['riskLevel']) => {
    switch (risk) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getTypeColor = (type: Strategy['type']) => {
    switch (type) {
      case 'trend-following': return 'bg-blue-500/20 text-blue-400';
      case 'mean-reversion': return 'bg-green-500/20 text-green-400';
      case 'breakout': return 'bg-purple-500/20 text-purple-400';
      case 'scalping': return 'bg-orange-500/20 text-orange-400';
      case 'swing': return 'bg-pink-500/20 text-pink-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="px-4 pt-4 pb-24 min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-primary-300 drop-shadow-glow">AI Strategy Builder</h1>
        <button
          onClick={createNewStrategy}
          className="bg-primary-500 hover:bg-primary-600 text-white rounded-full px-4 py-2 shadow-holographic transition-all duration-200 active:scale-95"
        >
          + New Strategy
        </button>
      </div>

      {/* Strategy Creation Modal */}
      {isCreating && currentStrategy && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-dark-800 rounded-xl p-6 w-full max-w-md shadow-glass backdrop-blur-xs border border-dark-700">
            <h2 className="text-xl font-bold text-white mb-4">Create New Strategy</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Strategy Name</label>
                <input
                  type="text"
                  value={currentStrategy.name}
                  onChange={(e) => setCurrentStrategy(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                  placeholder="Enter strategy name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={currentStrategy.description}
                  onChange={(e) => setCurrentStrategy(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                  placeholder="Describe your strategy"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                  <select
                    value={currentStrategy.type}
                    onChange={(e) => setCurrentStrategy(prev => prev ? { ...prev, type: e.target.value as Strategy['type'] } : null)}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                  >
                    <option value="trend-following">Trend Following</option>
                    <option value="mean-reversion">Mean Reversion</option>
                    <option value="breakout">Breakout</option>
                    <option value="scalping">Scalping</option>
                    <option value="swing">Swing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Risk Level</label>
                  <select
                    value={currentStrategy.riskLevel}
                    onChange={(e) => setCurrentStrategy(prev => prev ? { ...prev, riskLevel: e.target.value as Strategy['riskLevel'] } : null)}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Stop Loss (%)</label>
                  <input
                    type="number"
                    value={currentStrategy.stopLoss}
                    onChange={(e) => setCurrentStrategy(prev => prev ? { ...prev, stopLoss: Number(e.target.value) } : null)}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Take Profit (%)</label>
                  <input
                    type="number"
                    value={currentStrategy.takeProfit}
                    onChange={(e) => setCurrentStrategy(prev => prev ? { ...prev, takeProfit: Number(e.target.value) } : null)}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setIsCreating(false);
                  setCurrentStrategy(null);
                }}
                className="flex-1 bg-dark-700 hover:bg-dark-600 text-white py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveStrategy}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg transition-colors"
              >
                Save Strategy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Strategy Templates */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Strategy Templates</h2>
        <div className="grid grid-cols-1 gap-4">
          {strategyTemplates.map(template => (
            <div
              key={template.id}
              className="bg-dark-800/70 rounded-xl p-4 shadow-glass backdrop-blur-xs border border-dark-700"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white mb-1">{template.name}</h3>
                  <p className="text-gray-300 text-sm mb-2">{template.description}</p>
                </div>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(template.type)}`}>
                    {template.type}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(template.riskLevel)}`}>
                    {template.riskLevel} risk
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-400">Stop Loss:</span>
                  <span className="text-white ml-2">{template.stopLoss}%</span>
                </div>
                <div>
                  <span className="text-gray-400">Take Profit:</span>
                  <span className="text-white ml-2">{template.takeProfit}%</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setCurrentStrategy(template);
                    setIsCreating(true);
                  }}
                  className="flex-1 bg-dark-700 hover:bg-dark-600 text-white py-2 px-3 rounded-lg text-sm transition-colors"
                >
                  Use Template
                </button>
                <button
                  onClick={() => backtestStrategy(template)}
                  disabled={isBacktesting}
                  className="bg-primary-500 hover:bg-primary-600 text-white py-2 px-3 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {isBacktesting ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* My Strategies */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">My Strategies</h2>
        {strategies.length === 0 ? (
          <div className="text-center py-8">
            <Settings className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Custom Strategies</h3>
            <p className="text-gray-500 mb-4">Create your first trading strategy to get started</p>
            <button
              onClick={createNewStrategy}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Create Strategy
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {strategies.map(strategy => (
              <div
                key={strategy.id}
                className="bg-dark-800/70 rounded-xl p-4 shadow-glass backdrop-blur-xs border border-dark-700"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white mb-1">{strategy.name}</h3>
                    <p className="text-gray-300 text-sm mb-2">{strategy.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(strategy.type)}`}>
                      {strategy.type}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(strategy.riskLevel)}`}>
                      {strategy.riskLevel} risk
                    </span>
                  </div>
                </div>

                {strategy.backtestResults && (
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-400">Win Rate:</span>
                      <span className="text-white ml-2">{strategy.backtestResults.winRate.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Total Return:</span>
                      <span className={`ml-2 ${strategy.backtestResults.totalReturn >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
                        {strategy.backtestResults.totalReturn >= 0 ? '+' : ''}{strategy.backtestResults.totalReturn.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => backtestStrategy(strategy)}
                    disabled={isBacktesting}
                    className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 px-3 rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    {isBacktesting ? 'Backtesting...' : 'Backtest'}
                  </button>
                  <button
                    onClick={() => navigate('/add-trade')}
                    className="bg-dark-700 hover:bg-dark-600 text-white py-2 px-3 rounded-lg text-sm transition-colors"
                  >
                    Use Strategy
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIStrategyBuilder; 