import { ExternalLink, X } from 'lucide-react';

interface LevelData {
  id: string;
  progress: number;
  isActive: boolean;
}

export function InfernoLevelSystem() {
  const levels: LevelData[] = [
    { id: 'M-1', progress: 100, isActive: true },
    { id: 'M-2', progress: 100, isActive: true },
    { id: 'M-3', progress: 100, isActive: true },
    { id: 'M-4', progress: 0, isActive: false },
  ];

  const renderProgressBars = (progress: number, isActive: boolean) => {
    const bars = Array.from({ length: 10 }, (_, i) => {
      const barProgress = Math.max(0, Math.min(100, (progress - i * 10) * 10));
      return (
        <div
          key={i}
          className={`h-2 rounded-sm ${
            isActive && barProgress > 0 ? 'bg-red-500' : 'bg-gray-600'
          }`}
          style={{
            opacity: isActive && barProgress > 0 ? 1 : 0.3
          }}
        />
      );
    });
    return bars;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <div className="w-5 h-5 bg-orange-500 rounded-full"></div>
        <h3 className="text-white text-lg">Inferno Level System</h3>
      </div>

      <div className="space-y-4">
        {levels.map((level) => (
          <div key={level.id} className="flex items-center space-x-4">
            <div className="w-12 text-gray-400 text-sm">
              {level.id}
            </div>
            <div className="flex-1 grid grid-cols-10 gap-1">
              {renderProgressBars(level.progress, level.isActive)}
            </div>
            <button className="text-gray-400 hover:text-white transition-colors">
              {level.isActive ? <ExternalLink size={16} /> : <X size={16} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}