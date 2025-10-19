"use client";

import { useState, useEffect } from 'react';
import AuthPage from '@/components/AuthPage';
import DashboardPage from '@/components/DashboardPage';
import LoadingScreen from '@/components/LoadingScreen';

type Role = 'student' | 'teacher';

export default function App() {
  const [role, setRole] = useState<Role | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedRole = localStorage.getItem('authRole') as Role;
    if (storedToken && storedRole) {
      setToken(storedToken);
      setRole(storedRole);
    }
    setIsAuthReady(true);
  }, []);

  const handleLogin = (newToken: string, newRole: Role) => {
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authRole', newRole);
    setToken(newToken);
    setRole(newRole);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authRole');
    setToken(null);
    setRole(null);
  };
  
  if (isLoading) {
    return <LoadingScreen onAnimationComplete={() => setIsLoading(false)} />;
  }

  if (!isAuthReady) {
    return <div className="bg-slate-900 min-h-screen"></div>;
  }

  if (!role) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return <DashboardPage role={role} token={token} onLogout={handleLogout} />;
}
