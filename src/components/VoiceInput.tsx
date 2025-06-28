
import React from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import RecordingControls from '@/components/RecordingControls';
import TranscriptDisplay from '@/components/TranscriptDisplay';

interface VoiceInputProps {
  onTranscription: (text: string) => void;
  isDisabled: boolean;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscription, isDisabled }) => {
  const {
    isRecording,
    hasError,
    currentTranscript,
    startRecording,
    stopRecording,
    handleRetry
  } = useSpeechRecognition({ onTranscription });

  return (
    <div className="flex flex-col items-center gap-4">
      <RecordingControls
        isRecording={isRecording}
        hasError={hasError}
        isDisabled={isDisabled}
        onStart={startRecording}
        onStop={stopRecording}
        onRetry={handleRetry}
      />
      
      <TranscriptDisplay transcript={currentTranscript} />
    </div>
  );
};

export default VoiceInput;
