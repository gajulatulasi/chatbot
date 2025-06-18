import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'SET_AUTH'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_AUTH':
      return {
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
      };
    case 'LOGOUT':
      return {
        user: null,
        token: null,
        isAuthenticated: false,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('chatbot_token');
    const userData = localStorage.getItem('chatbot_user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        dispatch({ type: 'SET_AUTH', payload: { user, token } });
      } catch (error) {
        localStorage.removeItem('chatbot_token');
        localStorage.removeItem('chatbot_user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock authentication - in production, this would be a real API call
      if (email && password.length >= 6) {
        const user: User = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          name: email.split('@')[0],
          createdAt: new Date().toISOString(),
        };
        
        const token = 'mock_jwt_token_' + Math.random().toString(36).substr(2, 9);
        
        localStorage.setItem('chatbot_token', token);
        localStorage.setItem('chatbot_user', JSON.stringify(user));
        
        dispatch({ type: 'SET_AUTH', payload: { user, token } });
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock registration - in production, this would be a real API call
      if (email && password.length >= 6 && name) {
        const user: User = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          name,
          createdAt: new Date().toISOString(),
        };
        
        const token = 'mock_jwt_token_' + Math.random().toString(36).substr(2, 9);
        
        localStorage.setItem('chatbot_token', token);
        localStorage.setItem('chatbot_user', JSON.stringify(user));
        
        dispatch({ type: 'SET_AUTH', payload: { user, token } });
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('chatbot_token');
    localStorage.removeItem('chatbot_user');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};