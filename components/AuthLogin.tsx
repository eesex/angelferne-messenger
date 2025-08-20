import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { Eye, EyeOff, User, Lock } from 'lucide-react';

interface AuthLoginProps {
  onLogin: (credentials: { username: string; password: string }) => void;
  error: string;
}

export function AuthLogin({ onLogin, error }: AuthLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({ username, password });
  };

  const demoAccounts = [
    { username: 'admin', password: 'admin', status: '👑 Администратор' },
    { username: 'demo', password: 'demo', status: '✅ Активная подписка' },
    { username: 'user', password: 'user', status: '❌ Подписка истекла' },
    { username: 'expired', password: 'expired', status: '🚫 Старая подписка' },
  ];

  return (
    <div className="min-h-screen bg-[#030213] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-red-600 rounded-sm transform rotate-45"></div>
            </div>
          </div>
          <h1 className="text-white text-xl mb-2">
            <span className="text-red-500">AngelFerne</span> Messenger
          </h1>
          <p className="text-gray-400 text-sm">Система управления Twitch ботом</p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white text-sm mb-2">Логин</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-red-500"
                  placeholder="Введите логин"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-white text-sm mb-2">Пароль</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-red-500"
                  placeholder="Введите пароль"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <Alert className="bg-red-900 border-red-700">
                <AlertDescription className="text-red-200">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              Войти в систему
            </Button>
          </form>
        </div>

        {/* Demo Accounts */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-white text-sm mb-3">Тестовые аккаунты:</h3>
          <div className="space-y-2">
            {demoAccounts.map((account, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-700 rounded text-xs cursor-pointer hover:bg-gray-600 transition-colors"
                onClick={() => {
                  setUsername(account.username);
                  setPassword(account.password);
                }}
              >
                <span className="text-white">{account.username}/{account.password}</span>
                <span className="text-gray-300">{account.status}</span>
              </div>
            ))}
          </div>
          <p className="text-gray-400 text-xs mt-3">Нажмите на аккаунт для автозаполнения</p>
        </div>
      </div>
    </div>
  );
}