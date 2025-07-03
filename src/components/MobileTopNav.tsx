import React from 'react';
import { useUser } from '../contexts/UserContext';
import { 
  Bell, 
  Search, 
  Settings, 
  User,
  TrendingUp,
  Menu
} from 'lucide-react';

const MobileTopNav: React.FC = () => {
  const { state: userState, logout } = useUser();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-dark-800/90 backdrop-blur-lg border-b border-dark-700">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo/Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              TradeNote
            </h1>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          {/* Search */}
          <button className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors">
            <Search className="w-5 h-5 text-gray-300" />
          </button>

          {/* Notifications */}
          <button className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors relative">
            <Bell className="w-5 h-5 text-gray-300" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors">
              <User className="w-5 h-5 text-gray-300" />
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-dark-800 border border-dark-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="py-2">
                <div className="px-4 py-2 border-b border-dark-700">
                  <p className="text-white font-medium">{userState.user?.name || 'User'}</p>
                  <p className="text-gray-400 text-sm">{userState.user?.email}</p>
                </div>
                
                <button className="w-full text-left px-4 py-2 text-gray-300 hover:bg-dark-700 transition-colors flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
                
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-400 hover:bg-dark-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Menu */}
          <button className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors">
            <Menu className="w-5 h-5 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-gray-400">Today's P&L</p>
              <p className="text-green-400 font-medium">+$1,234</p>
            </div>
            <div>
              <p className="text-gray-400">Win Rate</p>
              <p className="text-primary-400 font-medium">68%</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-400">Active Trades</p>
            <p className="text-white font-medium">3</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileTopNav; 