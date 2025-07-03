import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Eye, 
  Bell, 
  Target,
  DollarSign,
  BarChart3,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { localDatabase, Trade } from '../lib/localDatabase';
import { realDataService, PriceData } from '../lib/realDataService';

interface QuickStats {
  todayPnL: number;
  openTrades: number;
  winRate: number;
  activeAlerts: number;
}

interface WidgetProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
  trend?: 'up' | 'down' | 'neutral';
}

const Widget: React.FC<WidgetProps> = ({ title, value, icon, color, onClick, trend }) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center p-4 bg-dark-800/50 backdrop-blur-lg rounded-xl border border-dark-700 hover:border-primary-500/50 transition-all duration-300 hover:shadow-holographic active:scale-95"
    >
      <div className={`p-3 rounded-lg ${color} mb-3`}>
        {icon}
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-400 mb-1">{title}</p>
        <p className="text-lg font-bold text-white">{value}</p>
        {trend && (
          <div className="flex items-center justify-center mt-1">
            {trend === 'up' && <TrendingUp className="w-3 h-3 text-green-400" />}
            {trend === 'down' && <TrendingDown className="w-3 h-3 text-red-400" />}
            {trend === 'neutral' && <div className="w-3 h-3" />}
          </div>
        )}
      </div>
    </button>
  );
};

const MobileWidgets: React.FC = () => {
  const navigate = useNavigate();
  const [quickStats, setQuickStats] = useState<QuickStats>({
    todayPnL: 0,
    openTrades: 0,
    winRate: 0,
    activeAlerts: 0
  });
  const [recentPrices, setRecentPrices] = useState<PriceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWidgetData();
  }, []);

  const loadWidgetData = async () => {
    try {
      setIsLoading(true);
      
      // Initialize database
      await localDatabase.initialize();
      
      // Load today's trades
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTrades = await localDatabase.getTrades({
        startDate: today.toISOString(),
        endDate: new Date().toISOString()
      });
      
      // Calculate today's P&L
      const todayPnL = todayTrades.reduce((sum, trade) => sum + (trade.profit || 0), 0);
      
      // Get open trades (trades without exit price)
      const allTrades = await localDatabase.getTrades({ limit: 100 });
      const openTrades = allTrades.filter(t => !t.exitPrice);
      
      // Calculate win rate
      const closedTrades = allTrades.filter(t => t.exitPrice);
      const winningTrades = closedTrades.filter(t => t.profit && t.profit > 0).length;
      const winRate = closedTrades.length > 0 ? (winningTrades / closedTrades.length) * 100 : 0;
      
      // Get active alerts
      const alerts = await localDatabase.getAlerts();
      const activeAlerts = alerts.filter(a => a.isActive);
      
      setQuickStats({
        todayPnL,
        openTrades: openTrades.length,
        winRate,
        activeAlerts: activeAlerts.length
      });
      
      // Load watchlist prices
      const watchlist = await localDatabase.getWatchlist();
      const prices = await Promise.all(
        watchlist.slice(0, 3).map(item => 
          realDataService.getRealTimePrice(item.symbol).catch(() => null)
        )
      );
      setRecentPrices(prices.filter(Boolean) as PriceData[]);
      
    } catch (error) {
      console.error('Error loading widget data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-dark-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Widget
          title="Today's P&L"
          value={formatCurrency(quickStats.todayPnL)}
          icon={<DollarSign className="w-6 h-6 text-white" />}
          color={quickStats.todayPnL >= 0 ? "bg-green-500/20" : "bg-red-500/20"}
          onClick={() => navigate('/journal')}
          trend={quickStats.todayPnL > 0 ? 'up' : quickStats.todayPnL < 0 ? 'down' : 'neutral'}
        />
        
        <Widget
          title="Open Trades"
          value={quickStats.openTrades}
          icon={<Eye className="w-6 h-6 text-white" />}
          color="bg-blue-500/20"
          onClick={() => navigate('/live-trades')}
        />
        
        <Widget
          title="Win Rate"
          value={formatPercentage(quickStats.winRate)}
          icon={<Target className="w-6 h-6 text-white" />}
          color="bg-primary-500/20"
          onClick={() => navigate('/performance-calendar')}
        />
        
        <Widget
          title="Active Alerts"
          value={quickStats.activeAlerts}
          icon={<Bell className="w-6 h-6 text-white" />}
          color="bg-yellow-500/20"
          onClick={() => navigate('/alarms')}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-dark-800/50 backdrop-blur-lg rounded-xl p-4 border border-dark-700">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/add-trade')}
            className="flex items-center space-x-3 p-3 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5 text-white" />
            <span className="text-white font-medium">Add Trade</span>
          </button>
          
          <button
            onClick={() => navigate('/watchlist')}
            className="flex items-center space-x-3 p-3 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
          >
            <Eye className="w-5 h-5 text-gray-300" />
            <span className="text-gray-300 font-medium">Watchlist</span>
          </button>
          
          <button
            onClick={() => navigate('/ai-coach')}
            className="flex items-center space-x-3 p-3 bg-secondary-600 hover:bg-secondary-700 rounded-lg transition-colors"
          >
            <BarChart3 className="w-5 h-5 text-white" />
            <span className="text-white font-medium">AI Coach</span>
          </button>
          
          <button
            onClick={() => navigate('/news')}
            className="flex items-center space-x-3 p-3 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
          >
            <AlertTriangle className="w-5 h-5 text-gray-300" />
            <span className="text-gray-300 font-medium">News</span>
          </button>
        </div>
      </div>

      {/* Recent Prices */}
      {recentPrices.length > 0 && (
        <div className="bg-dark-800/50 backdrop-blur-lg rounded-xl p-4 border border-dark-700">
          <h3 className="text-lg font-semibold text-white mb-4">Watchlist</h3>
          <div className="space-y-3">
            {recentPrices.map((item) => (
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
      )}
    </div>
  );
};

export default MobileWidgets; 