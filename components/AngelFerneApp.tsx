import React, { useState, useEffect } from 'react';
import { AuthLogin } from './AuthLogin';
import { Dashboard } from './Dashboard';
import { TwitchBot } from './TwitchBot';
import { UserRegistration } from './UserRegistration';
import { Sidebar } from './Sidebar';
import { Home, BarChart3, MessageSquare, Bot, Users, Terminal, LogOut, Crown } from 'lucide-react';
import { Button } from './ui/button';

interface User {
  username: string;
  subscriptionExpiry: string;
  isAdmin: boolean;
}

type ActivePage = 'home' | 'dashboard' | 'twitch-bot' | 'chat-management' | 'user-management' | 'logs';

export function AngelFerneApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState('');
  const [activePage, setActivePage] = useState<ActivePage>('home');

  useEffect(() => {
    const savedAuth = localStorage.getItem('angelferne_auth');
    if (savedAuth) {
      try {
        const userData = JSON.parse(savedAuth);
        if (isSubscriptionValid(userData.subscriptionExpiry, userData.isAdmin)) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('angelferne_auth');
          setAuthError('Срок подписки истёк.');
        }
      } catch (error) {
        localStorage.removeItem('angelferne_auth');
      }
    }
  }, []);

  const isSubscriptionValid = (subscriptionExpiry: string, isAdmin: boolean): boolean => {
    if (isAdmin) return true;
    const expiryDate = new Date(subscriptionExpiry);
    const currentDate = new Date();
    return currentDate <= expiryDate;
  };

  const handleLogin = (credentials: { username: string; password: string }) => {
    setAuthError('');

    if (credentials.username === 'admin' && credentials.password === 'admin') {
      const userData: User = {
        username: credentials.username,
        subscriptionExpiry: '2024-12-31',
        isAdmin: true
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('angelferne_auth', JSON.stringify(userData));
    }
    else if (credentials.username === 'demo' && credentials.password === 'demo') {
      const userData: User = {
        username: credentials.username,
        subscriptionExpiry: '2024-12-31',
        isAdmin: false
      };
      
      if (isSubscriptionValid(userData.subscriptionExpiry, userData.isAdmin)) {
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('angelferne_auth', JSON.stringify(userData));
      } else {
        setAuthError('Срок подписки истёк.');
      }
    }
    else if (credentials.username === 'user' && credentials.password === 'user') {
      const userData: User = {
        username: credentials.username,
        subscriptionExpiry: '2024-01-01',
        isAdmin: false
      };
      
      if (isSubscriptionValid(userData.subscriptionExpiry, userData.isAdmin)) {
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('angelferne_auth', JSON.stringify(userData));
      } else {
        setAuthError('Срок подписки истёк.');
      }
    }
    else if (credentials.username === 'expired' && credentials.password === 'expired') {
      const userData: User = {
        username: credentials.username,
        subscriptionExpiry: '2023-12-01',
        isAdmin: false
      };
      
      if (isSubscriptionValid(userData.subscriptionExpiry, userData.isAdmin)) {
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('angelferne_auth', JSON.stringify(userData));
      } else {
        setAuthError('Срок подписки истёк.');
      }
    }
    else {
      setAuthError('Неверные учетные данные');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setActivePage('home');
    localStorage.removeItem('angelferne_auth');
  };

  const sidebarItems = [
    { id: 'home' as ActivePage, label: 'Home', icon: Home },
    { id: 'dashboard' as ActivePage, label: 'Dashboard', icon: BarChart3 },
    { id: 'twitch-bot' as ActivePage, label: 'Twitch Bot', icon: Bot },
    { id: 'chat-management' as ActivePage, label: 'Chat Management', icon: MessageSquare },
    ...(user?.isAdmin ? [{ id: 'user-management' as ActivePage, label: 'User Management', icon: Users }] : []),
    { id: 'logs' as ActivePage, label: 'Logs', icon: Terminal },
  ];

  if (!isAuthenticated) {
    return <AuthLogin onLogin={handleLogin} error={authError} />;
  }

  const renderContent = () => {
    switch (activePage) {
      case 'home':
        return (
          <div className="p-8 bg-[#030213] min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-sm transform rotate-45"></div>
                </div>
                <span className="text-white text-sm">Welcome to <span className="text-red-500">AngelFerne</span></span>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Выйти из системы
              </Button>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
              <div>
                <h1 className="text-white text-2xl mb-2 flex items-center gap-2">
                  Добро пожаловать, {user?.username}!
                  {user?.isAdmin && <Crown className="w-5 h-5 text-yellow-500" />}
                </h1>
                <p className="text-gray-400">Панель управления AngelFerne Messenger</p>
              </div>

              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-white mb-1">Статус подписки</h3>
                  <p className="text-green-400">
                    {user?.isAdmin ? 'Администратор' : isSubscriptionValid(user?.subscriptionExpiry || '', false) ? 'Активна' : 'Истекла'}
                  </p>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-white mb-1">Администратор</h3>
                  <p className="text-gray-300">{user?.isAdmin ? 'Да' : 'Нет'}</p>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-white mb-1">Последний вход</h3>
                  <p className="text-gray-300">{new Date().toLocaleDateString('ru-RU')}</p>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-white mb-1">Версия</h3>
                  <p className="text-gray-300">AngelFerne v1.0</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-white text-lg mb-4">Быстрые действия</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => setActivePage('twitch-bot')}
                    className="bg-red-600 hover:bg-red-700 text-white p-4 h-auto flex flex-col items-center gap-2"
                  >
                    <Bot className="w-6 h-6" />
                    Открыть Twitch Bot
                  </Button>

                  <Button
                    onClick={() => setActivePage('dashboard')}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-4 h-auto flex flex-col items-center gap-2"
                  >
                    <BarChart3 className="w-6 h-6" />
                    Управление пользователями
                  </Button>

                  <Button
                    onClick={() => setActivePage('logs')}
                    className="bg-gray-600 hover:bg-gray-700 text-white p-4 h-auto flex flex-col items-center gap-2"
                  >
                    <Terminal className="w-6 h-6" />
                    Выйти из системы
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'twitch-bot':
        return <TwitchBot />;
      case 'chat-management':
        return (
          <div className="p-8 bg-[#030213] min-h-screen">
            <h1 className="text-white text-2xl mb-4">Chat Management</h1>
            <div className="bg-gray-800 rounded-lg p-6">
              <p className="text-gray-300">Управление чатом будет реализовано в следующих версиях.</p>
            </div>
          </div>
        );
      case 'user-management':
        return user?.isAdmin ? <UserRegistration /> : null;
      case 'logs':
        return (
          <div className="p-8 bg-[#030213] min-h-screen">
            <h1 className="text-white text-2xl mb-4">System Logs</h1>
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="space-y-2 text-sm font-mono">
                <div className="text-green-400">[{new Date().toLocaleTimeString()}] INFO: Система запущена</div>
                <div className="text-blue-400">[{new Date().toLocaleTimeString()}] DEBUG: Пользователь {user?.username} вошел в систему</div>
                <div className="text-yellow-400">[{new Date().toLocaleTimeString()}] WARN: Проверка подписки выполнена</div>
                <div className="text-green-400">[{new Date().toLocaleTimeString()}] INFO: Все системы работают нормально</div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#030213]">
      <Sidebar 
        items={sidebarItems}
        activeItem={activePage}
        onItemClick={setActivePage}
        user={user}
        onLogout={handleLogout}
      />
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
}