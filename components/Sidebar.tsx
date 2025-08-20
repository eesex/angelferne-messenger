import React from 'react';
import { Button } from './ui/button';
import { LogOut, Crown } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface User {
  username: string;
  subscriptionExpiry: string;
  isAdmin: boolean;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface SidebarProps {
  items: SidebarItem[];
  activeItem: string;
  onItemClick: (itemId: string) => void;
  user: User | null;
  onLogout: () => void;
}

export function Sidebar({ items = [], activeItem, onItemClick, user, onLogout }: SidebarProps) {
  return (
    <div className="w-64 bg-[#030213] border-r border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
            <div className="w-5 h-5 bg-white rounded-sm transform rotate-45"></div>
          </div>
          <div>
            <h2 className="text-white font-medium">AngelFerne</h2>
            <p className="text-gray-400 text-sm">Messenger</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-white text-sm">Welcome to</span>
          <span className="text-red-500 text-sm">AngelFerne</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-300 text-sm">{user?.username || 'Guest'}</span>
          {user?.isAdmin && <Crown className="w-4 h-4 text-yellow-500" />}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {user?.isAdmin ? 'Администратор' : 'Пользователь'}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <li key={item.id}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-left p-3 h-auto ${
                    isActive 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                  onClick={() => onItemClick(item.id)}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:bg-gray-800 hover:text-white p-3 h-auto"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Выйти из системы
        </Button>
      </div>
    </div>
  );
}