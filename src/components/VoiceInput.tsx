
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceInputProps {
  onTranscription: (text: string) => void;
  isDisabled: boolean;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscription, isDisabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasError, setHasError] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    // Check if speech recognition is supported
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Try using Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }

    // Clear any previous error state
    setHasError(false);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = navigator.language || 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      console.log('Speech recognition started');
      
      // Set a timeout to prevent hanging
      timeoutRef.current = setTimeout(() => {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
          toast({
            title: "Voice Input Timeout",
            description: "No speech detected within 10 seconds. Please try again.",
            variant: "destructive",
          });
        }
      }, 10000);
    };

    recognition.onresult = (event) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      const transcript = event.results[0][0].transcript;
      console.log('Speech recognition result:', transcript);
      
      if (transcript.trim()) {
        onTranscription(transcript);
        toast({
          title: "Voice Captured",
          description: "Speech has been transcribed successfully!",
        });
      } else {
        toast({
          title: "No Speech Detected",
          description: "No speech detected. Try speaking more clearly.",
          variant: "destructive",
        });
      }
    };

    recognition.onerror = (event) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      console.error('Speech recognition error:', event.error);
      setHasError(true);
      
      let errorMessage = "Voice recognition failed. Please try again.";
      
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        errorMessage = "Microphone access is required. Please allow microphone access when prompted by your browser.";
      } else if (event.error === 'no-speech') {
        errorMessage = "No speech detected. Try speaking more clearly.";
        setHasError(false); // This isn't really an error state
      } else if (event.error === 'audio-capture') {
        errorMessage = "Couldn't capture audio. Check your microphone connection.";
      } else if (event.error === 'network') {
        errorMessage = "Network error. Check your internet connection.";
      } else if (event.error === 'aborted') {
        errorMessage = "Voice input was interrupted. Please try again.";
        setHasError(false); // Reset error state for aborted
      }

      toast({
        title: "Voice Input Error",
        description: errorMessage,
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsRecording(false);
      console.log('Speech recognition ended');
    };

    recognitionRef.current = recognition;
    
    try {
      recognition.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setHasError(true);
      toast({
        title: "Voice Input Error",
        description: "Failed to start voice recognition. Please try again.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleRetry = () => {
    setHasError(false);
    startRecording();
  };

  if (hasError) {
    return (
      <div className="flex flex-col items-center gap-2">
        <Button
          onClick={handleRetry}
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
    <Button
      onClick={isRecording ? stopRecording : startRecording}
      disabled={isDisabled}
      variant={isRecording ? "destructive" : "outline"}
      className="flex items-center gap-2"
    >
      {isRecording ? (
        <MicOff className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
      {isRecording ? 'Stop Recording' : 'Voice Input'}
    </Button>
  );
};

export default VoiceInput;
