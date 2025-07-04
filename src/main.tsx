import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProvider } from './contexts/UserContext';
import { useUser } from './contexts/UserContext';
import ErrorBoundary from './components/ErrorBoundary';

// Import pages
import Auth from './pages/Auth';
import Dashboard from './pages/Index';
import AddTrade from './pages/AddTrade';
import Journal from './pages/Journal';
import LiveTrades from './pages/LiveTrades';
import History from './pages/History';
import AICoach from './pages/AICoach';
import AIStrategyBuilder from './pages/AIStrategyBuilder';
import News from './pages/News';
import Settings from './pages/Settings';
import Alarms from './pages/Alarms';
import PerformanceCalendar from './pages/PerformanceCalendar';
import ValidationTest from './pages/ValidationTest';
import TradeDetails from './pages/TradeDetails';

// Import components
import MobileTopNav from './components/MobileTopNav';
import MobileBottomNav from './components/MobileBottomNav';

// Import styles
import './assets/main.css';
import './styles/theme.css';

// Initialize React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useUser();
  
  console.log('ProtectedRoute state:', state);
  
  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!state.isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// Main App Component
const App: React.FC = () => {
  const { state } = useUser();
  
  console.log('App component state:', state);
  
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
        {state.isAuthenticated && <MobileTopNav />}
        
        <main className="pb-20">
          <Routes>
            {/* Public Routes */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/add-trade" element={
              <ProtectedRoute>
                <AddTrade />
              </ProtectedRoute>
            } />
            
            <Route path="/journal" element={
              <ProtectedRoute>
                <Journal />
              </ProtectedRoute>
            } />
            
            <Route path="/journal/:id" element={
              <ProtectedRoute>
                <TradeDetails />
              </ProtectedRoute>
            } />
            
            <Route path="/live-trades" element={
              <ProtectedRoute>
                <LiveTrades />
              </ProtectedRoute>
            } />
            
            <Route path="/history" element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            } />
            
            <Route path="/ai-coach" element={
              <ProtectedRoute>
                <AICoach />
              </ProtectedRoute>
            } />
            
            <Route path="/ai-strategy" element={
              <ProtectedRoute>
                <AIStrategyBuilder />
              </ProtectedRoute>
            } />
            
            <Route path="/news" element={
              <ProtectedRoute>
                <News />
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            
            <Route path="/alarms" element={
              <ProtectedRoute>
                <Alarms />
              </ProtectedRoute>
            } />
            
            <Route path="/performance-calendar" element={
              <ProtectedRoute>
                <PerformanceCalendar />
              </ProtectedRoute>
            } />
            
            <Route path="/validation-test" element={
              <ProtectedRoute>
                <ValidationTest />
              </ProtectedRoute>
            } />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        {state.isAuthenticated && <MobileBottomNav />}
      </div>
    </Router>
  );
};

// Root Component with Providers
const Root: React.FC = () => {
  console.log('Root component rendering...');
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <App />
        </UserProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

// Initialize the app
console.log('Starting app initialization...');
const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    console.log('React root created successfully');
    root.render(
      <React.StrictMode>
        <Root />
      </React.StrictMode>
    );
    console.log('App rendered successfully');
  } catch (error) {
    console.error('Error rendering app:', error);
  }
} else {
  console.error('Root element not found!');
}

export default Root; 