import { useState } from 'react';
import { MetricCard } from './MetricCard';
import { InfernoLevelSystem } from './InfernoLevelSystem';
import { TrendingUp, Target, DollarSign, Activity, BarChart3 } from 'lucide-react';

interface User {
  username: string;
  subscriptionExpiry: string;
  isAdmin: boolean;
}

interface DashboardProps {
  user: User | null;
}

export function Dashboard({ user }: DashboardProps) {
  return (
    <div className="p-8 bg-[#030213] min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-white text-2xl mb-2 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-red-500" />
          Dashboard
        </h1>
        <p className="text-gray-400">Статистика и аналитика AngelFerne</p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <MetricCard
          title="Your Percentage"
          value="98%"
          icon={<TrendingUp className="text-red-500" size={24} />}
        />
        <MetricCard
          title="Partner Fee"
          value="2%"
          icon={<Target className="text-red-500" size={24} />}
        />
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Inferno Level System */}
        <InfernoLevelSystem />

        {/* Right Side Metrics */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MetricCard
              title="Connection Number"
              value="397"
              icon={<Activity className="text-gray-400" size={20} />}
            />
            <MetricCard
              title="Hits Number"
              value="206"
              icon={<Target className="text-gray-400" size={20} />}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MetricCard
              title="Traffic Conversion"
              value="51.8890%"
              icon={<TrendingUp className="text-gray-400" size={20} />}
            />
            <MetricCard
              title="Total Drained"
              value="267902 $"
              icon={<DollarSign className="text-gray-400" size={20} />}
            />
          </div>
        </div>
      </div>

      {/* User Stats */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-white text-lg mb-4">Статистика пользователя</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-white mb-1">Пользователь</h4>
            <p className="text-gray-300">{user?.username || 'N/A'}</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-white mb-1">Статус</h4>
            <p className="text-gray-300">
              {user?.isAdmin ? 'Администратор' : 'Пользователь'}
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-white mb-1">Подписка</h4>
            <p className="text-gray-300">
              {user?.isAdmin ? 'Безлимитная' : user?.subscriptionExpiry || 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}