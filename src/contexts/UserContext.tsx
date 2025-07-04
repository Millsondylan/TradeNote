import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User } from '../lib/localDatabase';
import localDatabase from '../lib/localDatabase';

// Simple password hashing function (in production, use bcrypt or similar)
const hashPassword = (password: string): string => {
  return btoa(password); // Base64 encoding for demo - replace with proper hashing
};

const verifyPassword = (password: string, hashedPassword: string): boolean => {
  return hashPassword(password) === hashedPassword;
};

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    defaultCurrency: string;
    language: string;
    timezone: string;
  };
}

type UserAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<UserState['preferences']> }
  | { type: 'LOGOUT' };

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  preferences: {
    theme: 'dark',
    notifications: true,
    defaultCurrency: 'USD',
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  }
};

const userReducer = (state: UserState, action: UserAction): UserState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload, 
        isAuthenticated: !!action.payload,
        error: null 
      };
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'UPDATE_PREFERENCES':
      return { 
        ...state, 
        preferences: { ...state.preferences, ...action.payload }
      };
    case 'LOGOUT':
      return { 
        ...initialState, 
        isLoading: false,
        preferences: state.preferences // Keep preferences on logout
      };
    default:
      return state;
  }
};

interface UserContextType {
  state: UserState;
  dispatch: React.Dispatch<UserAction>;
  signup: (username: string, onboardingData: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  updatePreferences: (preferences: Partial<UserState['preferences']>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        console.log('UserProvider: Starting user load...');
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Initialize database
        console.log('UserProvider: Initializing database...');
        await localDatabase.initialize();
        console.log('UserProvider: Database initialized successfully');
        
        // Load preferences from localStorage
        console.log('UserProvider: Loading preferences...');
        const savedPreferences = localStorage.getItem('userPreferences');
        if (savedPreferences) {
          const preferences = JSON.parse(savedPreferences);
          dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
          console.log('UserProvider: Preferences loaded');
        }

        // Load user from localStorage
        console.log('UserProvider: Loading user from localStorage...');
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          console.log('UserProvider: Found saved user:', user.name);
          // Verify user still exists in database
          const dbUser = await localDatabase.getUser(user.id);
          if (dbUser) {
            dispatch({ type: 'SET_USER', payload: dbUser });
            console.log('UserProvider: User authenticated from database');
          } else {
            // User no longer exists in database, clear localStorage
            localStorage.removeItem('user');
            console.log('UserProvider: User not found in database, cleared localStorage');
          }
        } else {
          console.log('UserProvider: No saved user found');
        }
      } catch (error) {
        console.error('UserProvider: Error loading user:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load user data' });
      } finally {
        console.log('UserProvider: Finished loading, setting loading to false');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadUser();
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('userPreferences', JSON.stringify(state.preferences));
  }, [state.preferences]);

  // Save user to localStorage when it changes
  useEffect(() => {
    if (state.user) {
      localStorage.setItem('user', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('user');
    }
  }, [state.user]);

  const signup = async (username: string, onboardingData: any): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Check if username already exists
      const users = await localDatabase.getUsers();
      const existingUser = users.find(u => u.name === username);
      
      if (existingUser) {
        throw new Error('Username already taken');
      }

      // Create new user with onboarding data
      const newUser: User = {
        id: crypto.randomUUID(),
        email: `${username}@local`, // Dummy email for compatibility
        name: username,
        tradingStyle: onboardingData.tradingStyle || '',
        riskTolerance: onboardingData.riskTolerance || 'medium',
        experienceLevel: onboardingData.experienceLevel || 'beginner',
        preferences: {
          theme: 'dark',
          notifications: true,
          defaultCurrency: 'USD'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await localDatabase.createUser(newUser);
      dispatch({ type: 'SET_USER', payload: newUser });
    } catch (error) {
      console.error('Signup error:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Signup failed' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
      dispatch({ type: 'LOGOUT' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      if (!state.user) {
        throw new Error('No user logged in');
      }

      // Update user in database
      const updatedUser = { ...state.user, ...userData, updatedAt: new Date().toISOString() };
      await localDatabase.updateUser(updatedUser);
      dispatch({ type: 'SET_USER', payload: updatedUser });
    } catch (error) {
      console.error('Update user error:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update user' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updatePreferences = (preferences: Partial<UserState['preferences']>): void => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
  };

  const value: UserContextType = {
    state,
    dispatch,
    signup,
    logout,
    updateUser,
    updatePreferences,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext; 