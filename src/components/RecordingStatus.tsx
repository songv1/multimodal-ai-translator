
import React from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface RecordingStatusProps {
  status: 'waiting' | 'listening' | 'processing' | 'complete' | 'error';
  message?: string;
}

const RecordingStatus: React.FC<RecordingStatusProps> = ({ status, message }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'waiting':
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          text: 'Preparing to record...',
          className: 'text-blue-600 bg-blue-50 border-blue-200'
        };
      case 'listening':
        return {
          icon: <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />,
          text: 'Listening...',
          className: 'text-red-600 bg-red-50 border-red-200'
        };
      case 'processing':
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          text: 'Processing audio...',
          className: 'text-amber-600 bg-amber-50 border-amber-200'
        };
      case 'complete':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          text: 'Recording complete',
          className: 'text-green-600 bg-green-50 border-green-200'
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          text: message || 'Recording failed',
          className: 'text-red-600 bg-red-50 border-red-200'
        };
      default:
        return {
          icon: null,
          text: '',
          className: ''
        };
    }
  };

  const config = getStatusConfig();
  
  if (!config.icon) return null;

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm ${config.className}`}>
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
};

export default RecordingStatus;
