import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Bell, Plus, Trash2, Edit, TrendingUp, TrendingDown, Clock, DollarSign } from 'lucide-react';

interface Alarm {
  id: string;
  symbol: string;
  type: 'price-above' | 'price-below' | 'percentage-change';
  value: number;
  isActive: boolean;
  createdAt: string;
  triggeredAt?: string;
  description?: string;
}

const Alarms: React.FC = () => {
  const { state: userState } = useUser();
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAlarm, setNewAlarm] = useState({
    symbol: '',
    type: 'price-above' as Alarm['type'],
    value: 0,
    description: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadAlarms();
  }, []);

  const loadAlarms = async () => {
    try {
      // Simulate loading alarms
      const mockAlarms: Alarm[] = [
        {
          id: '1',
          symbol: 'AAPL',
          type: 'price-above',
          value: 150,
          isActive: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          description: 'Apple stock above $150'
        },
        {
          id: '2',
          symbol: 'TSLA',
          type: 'price-below',
          value: 200,
          isActive: true,
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          description: 'Tesla stock below $200'
        },
        {
          id: '3',
          symbol: 'BTC',
          type: 'percentage-change',
          value: 5,
          isActive: false,
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          triggeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          description: 'Bitcoin 5% change'
        }
      ];
      
      setAlarms(mockAlarms);
    } catch (error) {
      console.error('Error loading alarms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createAlarm = () => {
    if (!newAlarm.symbol.trim() || newAlarm.value <= 0) {
      alert('Please enter a valid symbol and value');
      return;
    }

    const alarm: Alarm = {
      id: Date.now().toString(),
      symbol: newAlarm.symbol.toUpperCase(),
      type: newAlarm.type,
      value: newAlarm.value,
      isActive: true,
      createdAt: new Date().toISOString(),
      description: newAlarm.description
    };

    setAlarms(prev => [alarm, ...prev]);
    setNewAlarm({ symbol: '', type: 'price-above', value: 0, description: '' });
    setShowCreateModal(false);
  };

  const toggleAlarm = (id: string) => {
    setAlarms(prev => prev.map(alarm => 
      alarm.id === id ? { ...alarm, isActive: !alarm.isActive } : alarm
    ));
  };

  const deleteAlarm = (id: string) => {
    setAlarms(prev => prev.filter(alarm => alarm.id !== id));
  };

  const getTypeIcon = (type: Alarm['type']) => {
    switch (type) {
      case 'price-above':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'price-below':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      case 'percentage-change':
        return <DollarSign className="w-4 h-4 text-yellow-400" />;
      default:
        return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeLabel = (type: Alarm['type']) => {
    switch (type) {
      case 'price-above':
        return 'Price Above';
      case 'price-below':
        return 'Price Below';
      case 'percentage-change':
        return '% Change';
      default:
        return 'Unknown';
    }
  };

  const getTypeColor = (type: Alarm['type']) => {
    switch (type) {
      case 'price-above':
        return 'bg-green-500/20 text-green-400';
      case 'price-below':
        return 'bg-red-500/20 text-red-400';
      case 'percentage-change':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 pt-4 pb-24 min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading alarms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-24 min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-primary-300 drop-shadow-glow">Price Alarms</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary-500 hover:bg-primary-600 text-white rounded-full px-4 py-2 shadow-holographic transition-all duration-200 active:scale-95"
        >
          + New Alarm
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-dark-800/70 rounded-xl p-4 shadow-glass backdrop-blur-xs border border-dark-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Active Alarms</span>
            <Bell className="w-5 h-5 text-primary-400" />
          </div>
          <span className="text-lg font-bold text-white">
            {alarms.filter(a => a.isActive).length}
          </span>
        </div>

        <div className="bg-dark-800/70 rounded-xl p-4 shadow-glass backdrop-blur-xs border border-dark-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Triggered Today</span>
            <Clock className="w-5 h-5 text-yellow-400" />
          </div>
          <span className="text-lg font-bold text-white">
            {alarms.filter(a => a.triggeredAt && new Date(a.triggeredAt).toDateString() === new Date().toDateString()).length}
          </span>
        </div>
      </div>

      {/* Alarms List */}
      <div className="space-y-4">
        {alarms.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Price Alarms</h3>
            <p className="text-gray-500 mb-4">Create your first price alarm to get notified of important price movements</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Create Alarm
            </button>
          </div>
        ) : (
          alarms.map(alarm => (
            <div
              key={alarm.id}
              className={`bg-dark-800/70 rounded-xl p-4 shadow-glass backdrop-blur-xs border ${
                alarm.isActive ? 'border-primary-500/50' : 'border-dark-700'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    alarm.isActive ? 'bg-primary-500/20' : 'bg-gray-500/20'
                  }`}>
                    {getTypeIcon(alarm.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{alarm.symbol}</h3>
                    <p className="text-gray-400 text-sm">{alarm.description || getTypeLabel(alarm.type)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(alarm.type)}`}>
                    {getTypeLabel(alarm.type)}
                  </span>
                  <button
                    onClick={() => toggleAlarm(alarm.id)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      alarm.isActive 
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                        : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-400">Target:</span>
                    <span className="text-white font-medium">
                      {alarm.type === 'percentage-change' ? `${alarm.value}%` : `$${alarm.value}`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-400">Created:</span>
                    <span className="text-gray-300">
                      {new Date(alarm.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {alarm.triggeredAt && (
                  <div className="text-right">
                    <div className="text-xs text-yellow-400">Triggered</div>
                    <div className="text-xs text-gray-400">
                      {new Date(alarm.triggeredAt).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => navigate(`/watchlist?symbol=${alarm.symbol}`)}
                  className="text-primary-400 hover:text-primary-300 text-sm transition-colors"
                >
                  View Chart
                </button>
                <button
                  onClick={() => deleteAlarm(alarm.id)}
                  className="text-red-400 hover:text-red-300 text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Alarm Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-dark-800 rounded-xl p-6 w-full max-w-md shadow-glass backdrop-blur-xs border border-dark-700">
            <h2 className="text-xl font-bold text-white mb-4">Create Price Alarm</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Symbol</label>
                <input
                  type="text"
                  value={newAlarm.symbol}
                  onChange={(e) => setNewAlarm(prev => ({ ...prev, symbol: e.target.value }))}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                  placeholder="e.g., AAPL, BTC"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Alarm Type</label>
                <select
                  value={newAlarm.type}
                  onChange={(e) => setNewAlarm(prev => ({ ...prev, type: e.target.value as Alarm['type'] }))}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                >
                  <option value="price-above">Price Above</option>
                  <option value="price-below">Price Below</option>
                  <option value="percentage-change">Percentage Change</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {newAlarm.type === 'percentage-change' ? 'Percentage (%)' : 'Price ($)'}
                </label>
                <input
                  type="number"
                  value={newAlarm.value}
                  onChange={(e) => setNewAlarm(prev => ({ ...prev, value: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                  placeholder={newAlarm.type === 'percentage-change' ? '5' : '150.00'}
                  step={newAlarm.type === 'percentage-change' ? '0.1' : '0.01'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={newAlarm.description}
                  onChange={(e) => setNewAlarm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                  placeholder="e.g., Apple stock above $150"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-dark-700 hover:bg-dark-600 text-white py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createAlarm}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg transition-colors"
              >
                Create Alarm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alarms; 