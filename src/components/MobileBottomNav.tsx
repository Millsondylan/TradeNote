import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Plus, 
  BookOpen, 
  TrendingUp, 
  Brain,
  BarChart3,
  Settings
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
}

const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems: NavItem[] = [
    {
      path: '/',
      label: 'Dashboard',
      icon: <Home className="w-6 h-6" />,
      activeIcon: <Home className="w-6 h-6" />
    },
    {
      path: '/add-trade',
      label: 'Add Trade',
      icon: <Plus className="w-6 h-6" />,
      activeIcon: <Plus className="w-6 h-6" />
    },
    {
      path: '/journal',
      label: 'Journal',
      icon: <BookOpen className="w-6 h-6" />,
      activeIcon: <BookOpen className="w-6 h-6" />
    },
    {
      path: '/live-trades',
      label: 'Live',
      icon: <TrendingUp className="w-6 h-6" />,
      activeIcon: <TrendingUp className="w-6 h-6" />
    },
    {
      path: '/ai-coach',
      label: 'AI Coach',
      icon: <Brain className="w-6 h-6" />,
      activeIcon: <Brain className="w-6 h-6" />
    },
    {
      path: '/performance-calendar',
      label: 'Performance',
      icon: <BarChart3 className="w-6 h-6" />,
      activeIcon: <BarChart3 className="w-6 h-6" />
    }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-dark-800/90 backdrop-blur-lg border-t border-dark-700">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                active 
                  ? 'text-primary-400 bg-primary-500/20' 
                  : 'text-gray-400 hover:text-gray-300 hover:bg-dark-700/50'
              }`}
            >
              {active ? item.activeIcon : item.icon}
              <span className="text-xs font-medium">{item.label}</span>
              
              {/* Active indicator */}
              {active && (
                <div className="w-1 h-1 bg-primary-400 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Settings button - separate from main nav */}
      <div className="absolute -top-12 right-4">
        <button
          onClick={() => navigate('/settings')}
          className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full shadow-lg hover:shadow-holographic transition-all duration-300 flex items-center justify-center"
        >
          <Settings className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
};

export default MobileBottomNav; 