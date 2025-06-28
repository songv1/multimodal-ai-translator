
import React from 'react';

interface SilenceCountdownProps {
  remainingTime: number;
  totalTime: number;
  isVisible: boolean;
}

const SilenceCountdown: React.FC<SilenceCountdownProps> = ({ 
  remainingTime, 
  totalTime, 
  isVisible 
}) => {
  if (!isVisible) return null;

  const progress = ((totalTime - remainingTime) / totalTime) * 100;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2 text-sm text-orange-600">
        <div className="w-4 h-4 rounded-full border-2 border-orange-300 relative overflow-hidden">
          <div 
            className="absolute bottom-0 left-0 right-0 bg-orange-500 transition-all duration-100"
            style={{ height: `${progress}%` }}
          />
        </div>
        <span>Silence: {Math.ceil(remainingTime / 1000)}s</span>
      </div>
      <p className="text-xs text-gray-500 text-center">
        Recording will stop after 5 seconds of silence
      </p>
    </div>
  );
};

export default SilenceCountdown;
