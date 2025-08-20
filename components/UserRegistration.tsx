import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { UserPlus, Mail, Lock, User, Calendar, Key } from 'lucide-react';

interface UserData {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  subscriptionEnd: string;
  isActive: boolean;
}

// Симуляция API для демонстрации (замените на реальный backend)
class UserRegistrationAPI {
  private static users: UserData[] = [
    {
      id: '1',
      username: 'admin',
      email: 'admin@example.com',
      createdAt: '2024-01-01',
      subscriptionEnd: '2024-12-31',
      isActive: true
    }
  ];

  static async registerUser(userData: Omit<UserData, 'id' | 'createdAt'>): Promise<{ success: boolean; user?: UserData; error?: string; accessKey?: string }> {
    // Имитация задержки API
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Проверка на существующего пользователя
    const existingUser = this.users.find(user => 
      user.username === userData.username || user.email === userData.email
    );

    if (existingUser) {
      return {
        success: false,
        error: 'Пользователь с таким именем или email уже существует'
      };
    }

    // Создание нового пользователя
    const newUser: UserData = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0]
    };

    this.users.push(newUser);

    // Генерация ключа доступа
    const accessKey = `AF_${newUser.id}_${Math.random().toString(36).substring(2, 15)}`;

    return {
      success: true,
      user: newUser,
      accessKey
    };
  }

  static async getUsers(): Promise<UserData[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.users;
  }

  static async updateUserStatus(userId: string, isActive: boolean): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.isActive = isActive;
      return true;
    }
    return false;
  }

  static async extendSubscription(userId: string, days: number): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = this.users.find(u => u.id === userId);
    if (user) {
      const currentEnd = new Date(user.subscriptionEnd);
      currentEnd.setDate(currentEnd.getDate() + days);
      user.subscriptionEnd = currentEnd.toISOString().split('T')[0];
      return true;
    }
    return false;
  }
}

export function UserRegistration() {
  const [activeTab, setActiveTab] = useState<'register' | 'manage'>('register');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [showAccessKey, setShowAccessKey] = useState<string | null>(null);

  // Registration form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    subscriptionDays: 30
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const subscriptionEnd = new Date();
      subscriptionEnd.setDate(subscriptionEnd.getDate() + formData.subscriptionDays);

      const result = await UserRegistrationAPI.registerUser({
        username: formData.username,
        email: formData.email,
        subscriptionEnd: subscriptionEnd.toISOString().split('T')[0],
        isActive: true
      });

      if (result.success && result.user && result.accessKey) {
        setMessage({
          type: 'success',
          text: `Пользователь ${result.user.username} успешно зарегистрирован!`
        });
        setShowAccessKey(result.accessKey);
        setFormData({ username: '', email: '', subscriptionDays: 30 });
        loadUsers(); // Обновляем список пользователей
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Ошибка регистрации'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Ошибка соединения с сервером'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const usersList = await UserRegistrationAPI.getUsers();
      setUsers(usersList);
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await UserRegistrationAPI.updateUserStatus(userId, !currentStatus);
      loadUsers();
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
    }
  };

  const extendSubscription = async (userId: string, days: number) => {
    try {
      await UserRegistrationAPI.extendSubscription(userId, days);
      loadUsers();
    } catch (error) {
      console.error('Ошибка продления подписки:', error);
    }
  };

  // Load users when switching to manage tab
  const handleTabChange = (tab: 'register' | 'manage') => {
    setActiveTab(tab);
    if (tab === 'manage') {
      loadUsers();
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b border-gray-700">
        <button
          onClick={() => handleTabChange('register')}
          className={`px-4 py-2 transition-colors ${
            activeTab === 'register'
              ? 'text-red-500 border-b-2 border-red-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <UserPlus className="w-4 h-4 inline mr-2" />
          Регистрация пользователей
        </button>
        <button
          onClick={() => handleTabChange('manage')}
          className={`px-4 py-2 transition-colors ${
            activeTab === 'manage'
              ? 'text-red-500 border-b-2 border-red-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4 inline mr-2" />
          Управление пользователями
        </button>
      </div>

      {activeTab === 'register' && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <UserPlus className="w-5 h-5 mr-2 text-red-500" />
              Создание нового пользователя
            </CardTitle>
            <CardDescription className="text-gray-400">
              Создайте аккаунт пользователя и получите ключ доступа
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-gray-300 text-sm flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    Имя пользователя
                  </label>
                  <Input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="username"
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-gray-300 text-sm flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    Email
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="user@example.com"
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-gray-300 text-sm flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Длительность подписки (дней)
                </label>
                <Input
                  type="number"
                  value={formData.subscriptionDays}
                  onChange={(e) => setFormData(prev => ({ ...prev, subscriptionDays: parseInt(e.target.value) || 30 }))}
                  min="1"
                  max="365"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              {message && (
                <Alert className={`${message.type === 'error' ? 'border-red-500 bg-red-900/20' : 'border-green-500 bg-green-900/20'}`}>
                  <AlertDescription className={message.type === 'error' ? 'text-red-400' : 'text-green-400'}>
                    {message.text}
                  </AlertDescription>
                </Alert>
              )}

              {showAccessKey && (
                <Alert className="border-blue-500 bg-blue-900/20">
                  <Key className="w-4 h-4" />
                  <AlertDescription className="text-blue-400">
                    <strong>Ключ доступа (сохраните!):</strong>
                    <br />
                    <code className="bg-gray-800 px-2 py-1 rounded text-white mt-1 block break-all">
                      {showAccessKey}
                    </code>
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Создание аккаунта...
                  </div>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Создать пользователя
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 'manage' && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <User className="w-5 h-5 mr-2 text-red-500" />
              Управление пользователями
            </CardTitle>
            <CardDescription className="text-gray-400">
              Управляйте статусом и подписками пользователей
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  Пользователи не найдены
                </div>
              ) : (
                users.map((user) => (
                  <div key={user.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">{user.username}</h3>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                        <p className="text-gray-400 text-xs">
                          Подписка до: {new Date(user.subscriptionEnd).toLocaleDateString()}
                          {new Date(user.subscriptionEnd) < new Date() && (
                            <span className="text-red-400 ml-2">(Истекла)</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.isActive ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'
                        }`}>
                          {user.isActive ? 'Активен' : 'Заблокирован'}
                        </span>
                        <Button
                          onClick={() => toggleUserStatus(user.id, user.isActive)}
                          size="sm"
                          variant="outline"
                          className="border-gray-600 text-gray-300"
                        >
                          {user.isActive ? 'Заблокировать' : 'Активировать'}
                        </Button>
                        <Button
                          onClick={() => extendSubscription(user.id, 30)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          +30 дней
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}