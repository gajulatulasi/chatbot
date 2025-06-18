import React, { useState } from 'react';
import { LoginForm } from './components/auth/LoginForm';
import { MainLayout } from './components/layout/MainLayout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { ThemeProvider } from './contexts/ThemeContext';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);

  if (!isAuthenticated) {
    return (
      <LoginForm
        onToggleMode={() => setIsLoginMode(!isLoginMode)}
        isLogin={isLoginMode}
      />
    );
  }

  return (
    <ChatProvider>
      <MainLayout />
    </ChatProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;