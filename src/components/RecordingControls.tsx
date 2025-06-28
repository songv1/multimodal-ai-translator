
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2, AlertCircle } from 'lucide-react';

interface RecordingControlsProps {
  isRecording: boolean;
  hasError: boolean;
  isDisabled: boolean;
  onStart: () => void;
  onStop: () => void;
  onRetry: () => void;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({
  isRecording,
  hasError,
  isDisabled,
  onStart,
  onStop,
  onRetry
}) => {
  if (hasError) {
    return (
      <div className="flex flex-col items-center gap-2">
        <Button
          onClick={onRetry}
          disabled={isDisabled}
          variant="outline"
          className="flex items-center gap-2 border-orange-300 text-orange-600 hover:bg-orange-50"
        >
          <AlertCircle className="h-4 w-4" />
          Try Again
        </Button>
        <p className="text-xs text-gray-500 text-center max-w-48">
          Voice input failed. Click to retry.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        onClick={isRecording ? onStop : onStart}
        disabled={isDisabled}
        variant={isRecording ? "destructive" : "outline"}
        className="flex items-center gap-2"
      >
        {isRecording ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </Button>
      
      {isRecording && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Listening... (stops after 5s of silence)</span>
        </div>
      )}
    </div>
  );
};

export default RecordingControls;
