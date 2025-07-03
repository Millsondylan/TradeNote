import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Calendar, TrendingUp, TrendingDown, DollarSign, BarChart3, CalendarDays } from 'lucide-react';

interface DayPerformance {
  date: string;
  pnl: number;
  trades: number;
  winRate: number;
  volume: number;
}

interface MonthPerformance {
  month: string;
  totalPnl: number;
  totalTrades: number;
  winRate: number;
  bestDay: DayPerformance;
  worstDay: DayPerformance;
}

const PerformanceCalendar: React.FC = () => {
  const { state: userState } = useUser();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [dailyPerformance, setDailyPerformance] = useState<DayPerformance[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthPerformance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadPerformanceData();
  }, [selectedMonth]);

  const loadPerformanceData = async () => {
    try {
      // Simulate loading performance data
      const daysInMonth = new Date(parseInt(selectedMonth.split('-')[0]), parseInt(selectedMonth.split('-')[1]), 0).getDate();
      const mockDailyData: DayPerformance[] = [];
      
      for (let day = 1; day <= daysInMonth; day++) {
        const hasData = Math.random() > 0.3; // 70% chance of having data
        if (hasData) {
          mockDailyData.push({
            date: `${selectedMonth}-${day.toString().padStart(2, '0')}`,
            pnl: (Math.random() - 0.5) * 1000, // -500 to +500
            trades: Math.floor(Math.random() * 10) + 1,
            winRate: Math.random() * 100,
            volume: Math.random() * 10000
          });
        }
      }
      
      setDailyPerformance(mockDailyData);
      
      // Calculate monthly stats
      if (mockDailyData.length > 0) {
        const totalPnl = mockDailyData.reduce((sum, day) => sum + day.pnl, 0);
        const totalTrades = mockDailyData.reduce((sum, day) => sum + day.trades, 0);
        const avgWinRate = mockDailyData.reduce((sum, day) => sum + day.winRate, 0) / mockDailyData.length;
        const bestDay = mockDailyData.reduce((best, day) => day.pnl > best.pnl ? day : best);
        const worstDay = mockDailyData.reduce((worst, day) => day.pnl < worst.pnl ? day : worst);
        
        setMonthlyStats({
          month: selectedMonth,
          totalPnl,
          totalTrades,
          winRate: avgWinRate,
          bestDay,
          worstDay
        });
      }
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPnlColor = (pnl: number) => {
    if (pnl > 0) return 'text-green-400';
    if (pnl < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getPnlBgColor = (pnl: number) => {
    if (pnl > 0) return 'bg-green-500/20 border-green-500/50';
    if (pnl < 0) return 'bg-red-500/20 border-red-500/50';
    return 'bg-gray-500/20 border-gray-500/50';
  };

  const getDayOfWeek = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getDayNumber = (dateString: string) => {
    return new Date(dateString).getDate();
  };

  const getMonthName = (monthString: string) => {
    const [year, month] = monthString.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const getStreakInfo = () => {
    if (dailyPerformance.length === 0) return { current: 0, longest: 0, type: 'neutral' };
    
    let currentStreak = 0;
    let longestStreak = 0;
    let currentType: 'win' | 'loss' | 'neutral' = 'neutral';
    
    // Sort by date
    const sortedDays = [...dailyPerformance].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    for (const day of sortedDays) {
      if (day.pnl > 0) {
        if (currentType === 'win') {
          currentStreak++;
        } else {
          currentStreak = 1;
          currentType = 'win';
        }
      } else if (day.pnl < 0) {
        if (currentType === 'loss') {
          currentStreak++;
        } else {
          currentStreak = 1;
          currentType = 'loss';
        }
      }
      
      longestStreak = Math.max(longestStreak, currentStreak);
    }
    
    return { current: currentStreak, longest: longestStreak, type: currentType };
  };

  if (isLoading) {
    return (
      <div className="px-4 pt-4 pb-24 min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading performance data...</p>
        </div>
      </div>
    );
  }

  const streakInfo = getStreakInfo();

  return (
    <div className="px-4 pt-4 pb-24 min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-primary-300 drop-shadow-glow">Performance Calendar</h1>
        <button
          onClick={() => navigate('/history')}
          className="bg-primary-500 hover:bg-primary-600 text-white rounded-full px-4 py-2 shadow-holographic transition-all duration-200 active:scale-95"
        >
          View History
        </button>
      </div>

      {/* Month Selector */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => {
            const current = new Date(selectedMonth + '-01');
            const prev = new Date(current.getFullYear(), current.getMonth() - 1, 1);
            setSelectedMonth(prev.toISOString().slice(0, 7));
          }}
          className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
        >
          ←
        </button>
        <h2 className="text-lg font-semibold text-white">{getMonthName(selectedMonth)}</h2>
        <button
          onClick={() => {
            const current = new Date(selectedMonth + '-01');
            const next = new Date(current.getFullYear(), current.getMonth() + 1, 1);
            setSelectedMonth(next.toISOString().slice(0, 7));
          }}
          className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
        >
          →
        </button>
      </div>

      {/* Monthly Summary */}
      {monthlyStats && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-dark-800/70 rounded-xl p-4 shadow-glass backdrop-blur-xs border border-dark-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Monthly P&L</span>
              <DollarSign className="w-5 h-5 text-primary-400" />
            </div>
            <span className={`text-lg font-bold ${getPnlColor(monthlyStats.totalPnl)}`}>
              {monthlyStats.totalPnl >= 0 ? '+' : ''}${monthlyStats.totalPnl.toFixed(2)}
            </span>
          </div>

          <div className="bg-dark-800/70 rounded-xl p-4 shadow-glass backdrop-blur-xs border border-dark-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Win Rate</span>
              <BarChart3 className="w-5 h-5 text-primary-400" />
            </div>
            <span className="text-lg font-bold text-white">{monthlyStats.winRate.toFixed(1)}%</span>
          </div>
        </div>
      )}

      {/* Streak Info */}
      <div className="bg-dark-800/70 rounded-xl p-4 mb-6 shadow-glass backdrop-blur-xs border border-dark-700">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-gray-400 text-sm">Current Streak</span>
            <div className="flex items-center space-x-2">
              <span className={`text-lg font-bold ${
                streakInfo.type === 'win' ? 'text-green-400' : 
                streakInfo.type === 'loss' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {streakInfo.current} days
              </span>
              <span className={`text-sm ${
                streakInfo.type === 'win' ? 'text-green-400' : 
                streakInfo.type === 'loss' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {streakInfo.type === 'win' ? 'winning' : 
                 streakInfo.type === 'loss' ? 'losing' : 'neutral'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-gray-400 text-sm">Longest Streak</span>
            <div className="text-lg font-bold text-white">{streakInfo.longest} days</div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-dark-800/70 rounded-xl p-4 shadow-glass backdrop-blur-xs border border-dark-700">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs text-gray-400 font-medium py-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {(() => {
            const firstDay = new Date(selectedMonth + '-01');
            const startOffset = firstDay.getDay();
            const daysInMonth = new Date(parseInt(selectedMonth.split('-')[0]), parseInt(selectedMonth.split('-')[1]), 0).getDate();
            
            const days = [];
            
            // Add empty cells for days before the first day of the month
            for (let i = 0; i < startOffset; i++) {
              days.push(<div key={`empty-${i}`} className="h-16"></div>);
            }
            
            // Add cells for each day of the month
            for (let day = 1; day <= daysInMonth; day++) {
              const dateString = `${selectedMonth}-${day.toString().padStart(2, '0')}`;
              const dayData = dailyPerformance.find(d => d.date === dateString);
              
              days.push(
                <div
                  key={day}
                  className={`h-16 p-1 rounded-lg border ${
                    dayData 
                      ? getPnlBgColor(dayData.pnl)
                      : 'border-dark-600 bg-dark-700/50'
                  }`}
                >
                  <div className="text-xs text-gray-400 mb-1">{day}</div>
                  {dayData && (
                    <div className="space-y-1">
                      <div className={`text-xs font-medium ${getPnlColor(dayData.pnl)}`}>
                        {dayData.pnl >= 0 ? '+' : ''}${dayData.pnl.toFixed(0)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {dayData.trades} trades
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            
            return days;
          })()}
        </div>
      </div>

      {/* Best/Worst Days */}
      {monthlyStats && (
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-dark-800/70 rounded-xl p-4 shadow-glass backdrop-blur-xs border border-green-500/50">
            <h3 className="text-sm font-medium text-green-400 mb-2">Best Day</h3>
            <div className="space-y-1">
              <div className="text-lg font-bold text-green-400">
                +${monthlyStats.bestDay.pnl.toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">
                {new Date(monthlyStats.bestDay.date).toLocaleDateString()}
              </div>
              <div className="text-xs text-gray-400">
                {monthlyStats.bestDay.trades} trades, {monthlyStats.bestDay.winRate.toFixed(1)}% win rate
              </div>
            </div>
          </div>

          <div className="bg-dark-800/70 rounded-xl p-4 shadow-glass backdrop-blur-xs border border-red-500/50">
            <h3 className="text-sm font-medium text-red-400 mb-2">Worst Day</h3>
            <div className="space-y-1">
              <div className="text-lg font-bold text-red-400">
                {monthlyStats.worstDay.pnl.toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">
                {new Date(monthlyStats.worstDay.date).toLocaleDateString()}
              </div>
              <div className="text-xs text-gray-400">
                {monthlyStats.worstDay.trades} trades, {monthlyStats.worstDay.winRate.toFixed(1)}% win rate
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceCalendar; 