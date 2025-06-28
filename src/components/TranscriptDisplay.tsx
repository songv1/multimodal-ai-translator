
import React from 'react';

interface TranscriptDisplayProps {
  transcript: string;
  label?: string;
}

const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({ 
  transcript, 
  label = "Real-time transcript:" 
}) => {
  if (!transcript) return null;

  return (
    <div className="w-full max-w-md p-3 bg-blue-50 rounded-md border border-blue-200">
      <p className="text-xs text-blue-600 font-medium mb-1">{label}</p>
      <p className="text-sm text-gray-800">{transcript}</p>
    </div>
  );
};

export default TranscriptDisplay;
