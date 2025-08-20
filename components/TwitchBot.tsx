import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { TwitchIRC } from './TwitchIRC';
import { 
  Play, 
  Pause, 
  MessageSquare, 
  Users, 
  Activity, 
  Eye,
  Send,
  Upload,
  Download,
  Trash2,
  Plus,
  Bot,
  Settings,
  AlertCircle
} from 'lucide-react';

interface TwitchAccount {
  username: string;
  token: string;
  channel: string;
}

interface LogEntry {
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

export function TwitchBot() {
  const [accounts, setAccounts] = useState<TwitchAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [message, setMessage] = useState('');
  const [autoMessage, setAutoMessage] = useState('');
  const [autoMessageInterval, setAutoMessageInterval] = useState(30);
  const [isAutoMessageActive, setIsAutoMessageActive] = useState(false);
  const [viewbotCount, setViewbotCount] = useState(10);
  const [isViewbotActive, setIsViewbotActive] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState({
    messagesSent: 0,
    viewersAdded: 0,
    uptime: 0
  });

  const [twitchIRC, setTwitchIRC] = useState<TwitchIRC | null>(null);

  useEffect(() => {
    const savedAccounts = localStorage.getItem('twitch_accounts');
    if (savedAccounts) {
      try {
        setAccounts(JSON.parse(savedAccounts));
      } catch (error) {
        addLog('error', 'Ошибка загрузки аккаунтов из localStorage');
      }
    }
  }, []);

  const addLog = (type: LogEntry['type'], message: string) => {
    const newLog: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message
    };
    setLogs(prev => [newLog, ...prev.slice(0, 99)]);
  };

  const saveAccounts = (newAccounts: TwitchAccount[]) => {
    setAccounts(newAccounts);
    localStorage.setItem('twitch_accounts', JSON.stringify(newAccounts));
  };

  const handleAccountFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const lines = content.split('\n').filter(line => line.trim());
      const newAccounts: TwitchAccount[] = [];

      lines.forEach(line => {
        const parts = line.split(',');
        if (parts.length >= 3) {
          newAccounts.push({
            username: parts[0].trim(),
            token: parts[1].trim(),
            channel: parts[2].trim()
          });
        }
      });

      if (newAccounts.length > 0) {
        saveAccounts(newAccounts);
        addLog('success', `Загружено ${newAccounts.length} аккаунтов`);
      } else {
        addLog('error', 'Не удалось загрузить аккаунты. Проверьте формат файла.');
      }
    };
    reader.readAsText(file);
  };

  const handleConnect = () => {
    if (!selectedAccount) {
      addLog('error', 'Выберите аккаунт для подключения');
      return;
    }

    const account = accounts.find(acc => acc.username === selectedAccount);
    if (!account) {
      addLog('error', 'Аккаунт не найден');
      return;
    }

    if (isConnected && twitchIRC) {
      twitchIRC.disconnect();
      setTwitchIRC(null);
      setIsConnected(false);
      addLog('info', 'Отключен от Twitch IRC');
    } else {
      const irc = new TwitchIRC();
      irc.on('connected', () => {
        setIsConnected(true);
        addLog('success', `Подключен к каналу ${account.channel} как ${account.username}`);
      });
      
      irc.on('disconnected', () => {
        setIsConnected(false);
        addLog('warning', 'Отключен от Twitch IRC');
      });
      
      irc.on('message', (channel: string, user: string, message: string) => {
        addLog('info', `${user}: ${message}`);
      });
      
      irc.on('error', (error: string) => {
        addLog('error', `Ошибка IRC: ${error}`);
      });

      irc.connect(account.username, account.token, account.channel);
      setTwitchIRC(irc);
    }
  };

  const handleSendMessage = () => {
    if (!message.trim() || !isConnected || !twitchIRC) {
      addLog('error', 'Введите сообщение и убедитесь что подключение активно');
      return;
    }

    const account = accounts.find(acc => acc.username === selectedAccount);
    if (account) {
      twitchIRC.sendMessage(account.channel, message);
      addLog('success', `Отправлено: ${message}`);
      setStats(prev => ({ ...prev, messagesSent: prev.messagesSent + 1 }));
      setMessage('');
    }
  };

  const toggleAutoMessage = () => {
    setIsAutoMessageActive(!isAutoMessageActive);
    if (!isAutoMessageActive) {
      addLog('info', `Автоотправка запущена (интервал: ${autoMessageInterval}с)`);
    } else {
      addLog('info', 'Автоотправка остановлена');
    }
  };

  const toggleViewbot = () => {
    setIsViewbotActive(!isViewbotActive);
    if (!isViewbotActive) {
      addLog('warning', `Viewbot запущен (${viewbotCount} viewers)`);
      setStats(prev => ({ ...prev, viewersAdded: prev.viewersAdded + viewbotCount }));
    } else {
      addLog('info', 'Viewbot остановлен');
    }
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className="p-6 bg-[#030213] min-h-screen">
      <div className="mb-6">
        <h1 className="text-white text-2xl mb-2">Twitch Bot Control Panel</h1>
        <p className="text-gray-400">Управление Twitch ботом с IRC подключением</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Connection Status */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Bot className="w-5 h-5" />
                Статус подключения
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <Badge className={isConnected ? 'bg-green-600' : 'bg-red-600'}>
                  {isConnected ? 'Подключен' : 'Отключен'}
                </Badge>
                {selectedAccount && (
                  <span className="text-gray-300">Аккаунт: {selectedAccount}</span>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm mb-2">Выберите аккаунт</label>
                  <select
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                    disabled={isConnected}
                  >
                    <option value="">Выберите аккаунт...</option>
                    {accounts.map((account, index) => (
                      <option key={index} value={account.username}>
                        {account.username} → {account.channel}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleConnect}
                    className={isConnected ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                  >
                    {isConnected ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {isConnected ? 'Отключиться' : 'Подключиться'}
                  </Button>
                  
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".txt"
                      onChange={handleAccountFileUpload}
                      className="hidden"
                    />
                    <Button variant="outline" className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Загрузить аккаунты
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Message Controls */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <MessageSquare className="w-5 h-5" />
                Отправка сообщений
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-white text-sm mb-2">Сообщение</label>
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Введите сообщение для отправки в чат..."
                    className="bg-gray-700 border-gray-600 text-white"
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!isConnected || !message.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-white text-sm">Автоотправка сообщений</label>
                  <Switch 
                    checked={isAutoMessageActive}
                    onCheckedChange={toggleAutoMessage}
                    disabled={!isConnected}
                  />
                </div>
                
                <div className="space-y-2">
                  <Input
                    value={autoMessage}
                    onChange={(e) => setAutoMessage(e.target.value)}
                    placeholder="Сообщение для автоотправки"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300 text-sm">Интервал:</span>
                    <Input
                      type="number"
                      value={autoMessageInterval}
                      onChange={(e) => setAutoMessageInterval(parseInt(e.target.value) || 30)}
                      min="10"
                      max="300"
                      className="w-20 bg-gray-700 border-gray-600 text-white"
                    />
                    <span className="text-gray-300 text-sm">секунд</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Viewbot Controls */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Eye className="w-5 h-5" />
                Viewbot Control
              </CardTitle>
              <CardDescription className="text-gray-400">
                Накрутка онлайна в канале
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-yellow-900 border-yellow-700">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription className="text-yellow-200">
                  Используйте ответственно. Нарушение ToS Twitch может привести к блокировке аккаунта.
                </AlertDescription>
              </Alert>

              <div className="flex items-center justify-between">
                <label className="text-white text-sm">Активация Viewbot</label>
                <Switch 
                  checked={isViewbotActive}
                  onCheckedChange={toggleViewbot}
                  disabled={!isConnected}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-gray-300 text-sm">Количество viewers:</span>
                <Input
                  type="number"
                  value={viewbotCount}
                  onChange={(e) => setViewbotCount(parseInt(e.target.value) || 10)}
                  min="1"
                  max="1000"
                  className="w-24 bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Statistics */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Activity className="w-5 h-5" />
                Статистика
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Сообщений отправлено:</span>
                <span className="text-white">{stats.messagesSent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Viewers добавлено:</span>
                <span className="text-white">{stats.viewersAdded}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Время работы:</span>
                <span className="text-white">{Math.floor(stats.uptime / 60)}:{(stats.uptime % 60).toString().padStart(2, '0')}</span>
              </div>
            </CardContent>
          </Card>

          {/* Console Logs */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Settings className="w-5 h-5" />
                Консоль логов
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 overflow-y-auto bg-gray-900 rounded p-3 font-mono text-xs">
                {logs.length === 0 ? (
                  <div className="text-gray-500">Логи будут отображаться здесь...</div>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className={`mb-1 ${getLogColor(log.type)}`}>
                      <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                    </div>
                  ))
                )}
              </div>
              <Button
                onClick={() => setLogs([])}
                variant="outline"
                size="sm"
                className="mt-2 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Очистить
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}