import { useState, useEffect, useRef } from 'react';

interface TwitchAccount {
  nickname: string;
  token: string;
  channel: string;
}

interface IRCMessage {
  timestamp: string;
  username: string;
  channel: string;
  message: string;
  type: 'message' | 'join' | 'part' | 'system';
}

export class TwitchIRC {
  private socket: WebSocket | null = null;
  private isConnected = false;
  private reconnectInterval: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private onMessageCallback: ((message: IRCMessage) => void) | null = null;
  private onStatusCallback: ((status: 'connecting' | 'connected' | 'disconnected' | 'error') => void) | null = null;

  constructor() {}

  connect(account: TwitchAccount) {
    if (this.socket) {
      this.disconnect();
    }

    this.updateStatus('connecting');
    
    try {
      // Используем WebSocket для подключения к Twitch IRC
      this.socket = new WebSocket('wss://irc-ws.chat.twitch.tv:443');
      
      this.socket.onopen = () => {
        if (this.socket) {
          // Авторизация в Twitch IRC
          this.socket.send(`PASS oauth:${account.token}`);
          this.socket.send(`NICK ${account.nickname}`);
          this.socket.send(`JOIN #${account.channel.replace('#', '')}`);
          
          // Запрос возможностей
          this.socket.send('CAP REQ :twitch.tv/membership');
          this.socket.send('CAP REQ :twitch.tv/tags');
          this.socket.send('CAP REQ :twitch.tv/commands');
          
          this.isConnected = true;
          this.updateStatus('connected');
          this.startPingInterval();
          
          this.addMessage({
            timestamp: new Date().toLocaleTimeString(),
            username: 'System',
            channel: account.channel,
            message: `Подключен к каналу ${account.channel}`,
            type: 'system'
          });
        }
      };

      this.socket.onmessage = (event) => {
        this.handleMessage(event.data, account);
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        this.updateStatus('disconnected');
        this.stopPingInterval();
        this.addMessage({
          timestamp: new Date().toLocaleTimeString(),
          username: 'System',
          channel: account.channel,
          message: 'Соединение разорвано',
          type: 'system'
        });
        
        // Автоматическое переподключение через 5 секунд
        this.reconnectInterval = setTimeout(() => {
          this.connect(account);
        }, 5000);
      };

      this.socket.onerror = () => {
        this.updateStatus('error');
        this.addMessage({
          timestamp: new Date().toLocaleTimeString(),
          username: 'System',
          channel: account.channel,
          message: 'Ошибка подключения к IRC',
          type: 'system'
        });
      };

    } catch (error) {
      this.updateStatus('error');
      this.addMessage({
        timestamp: new Date().toLocaleTimeString(),
        username: 'System',
        channel: account.channel,
        message: `Ошибка подключения: ${error}`,
        type: 'system'
      });
    }
  }

  disconnect() {
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    
    this.stopPingInterval();
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    this.isConnected = false;
    this.updateStatus('disconnected');
  }

  sendMessage(channel: string, message: string): boolean {
    if (!this.socket || !this.isConnected) {
      return false;
    }

    try {
      const cleanChannel = channel.startsWith('#') ? channel : `#${channel}`;
      this.socket.send(`PRIVMSG ${cleanChannel} :${message}`);
      
      this.addMessage({
        timestamp: new Date().toLocaleTimeString(),
        username: 'Вы',
        channel: cleanChannel,
        message: message,
        type: 'message'
      });
      
      return true;
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      return false;
    }
  }

  private handleMessage(data: string, account: TwitchAccount) {
    const lines = data.trim().split('\r\n');
    
    lines.forEach(line => {
      if (line.startsWith('PING')) {
        // Ответ на PING
        if (this.socket) {
          this.socket.send('PONG :tmi.twitch.tv');
        }
        return;
      }

      // Парсинг IRC сообщений
      const messageMatch = line.match(/:(\w+)!\w+@\w+\.tmi\.twitch\.tv PRIVMSG (#\w+) :(.+)/);
      if (messageMatch) {
        const [, username, channel, message] = messageMatch;
        
        this.addMessage({
          timestamp: new Date().toLocaleTimeString(),
          username,
          channel,
          message,
          type: 'message'
        });
      }

      // Парсинг JOIN/PART событий
      const joinMatch = line.match(/:(\w+)!\w+@\w+\.tmi\.twitch\.tv JOIN (#\w+)/);
      if (joinMatch) {
        const [, username, channel] = joinMatch;
        
        this.addMessage({
          timestamp: new Date().toLocaleTimeString(),
          username,
          channel,
          message: 'присоединился к чату',
          type: 'join'
        });
      }

      const partMatch = line.match(/:(\w+)!\w+@\w+\.tmi\.twitch\.tv PART (#\w+)/);
      if (partMatch) {
        const [, username, channel] = partMatch;
        
        this.addMessage({
          timestamp: new Date().toLocaleTimeString(),
          username,
          channel,
          message: 'покинул чат',
          type: 'part'
        });
      }
    });
  }

  private startPingInterval() {
    this.pingInterval = setInterval(() => {
      if (this.socket && this.isConnected) {
        this.socket.send('PING :tmi.twitch.tv');
      }
    }, 30000); // Пинг каждые 30 секунд
  }

  private stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private addMessage(message: IRCMessage) {
    if (this.onMessageCallback) {
      this.onMessageCallback(message);
    }
  }

  private updateStatus(status: 'connecting' | 'connected' | 'disconnected' | 'error') {
    if (this.onStatusCallback) {
      this.onStatusCallback(status);
    }
  }

  onMessage(callback: (message: IRCMessage) => void) {
    this.onMessageCallback = callback;
  }

  onStatusChange(callback: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void) {
    this.onStatusCallback = callback;
  }

  getConnectionStatus() {
    return this.isConnected ? 'connected' : 'disconnected';
  }
}

// Hook для использования в React компонентах
export function useTwitchIRC() {
  const ircRef = useRef<TwitchIRC | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [messages, setMessages] = useState<IRCMessage[]>([]);

  useEffect(() => {
    if (!ircRef.current) {
      ircRef.current = new TwitchIRC();
      
      ircRef.current.onMessage((message) => {
        setMessages(prev => [...prev, message]);
      });
      
      ircRef.current.onStatusChange((status) => {
        setConnectionStatus(status);
      });
    }

    return () => {
      if (ircRef.current) {
        ircRef.current.disconnect();
      }
    };
  }, []);

  const connect = (account: TwitchAccount) => {
    if (ircRef.current) {
      ircRef.current.connect(account);
    }
  };

  const disconnect = () => {
    if (ircRef.current) {
      ircRef.current.disconnect();
    }
  };

  const sendMessage = (channel: string, message: string) => {
    if (ircRef.current) {
      return ircRef.current.sendMessage(channel, message);
    }
    return false;
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    connect,
    disconnect,
    sendMessage,
    clearMessages,
    connectionStatus,
    messages,
    isConnected: connectionStatus === 'connected'
  };
}