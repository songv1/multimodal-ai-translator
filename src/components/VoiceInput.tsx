
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately as we only needed it for permission
      stream.getTracks().forEach(track => track.stop());
      setPermissionStatus('granted');
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setPermissionStatus('denied');
      toast({
        title: "Microphone Permission Required",
        description: "Please allow microphone access to use voice input. Check your browser settings.",
        variant: "destructive",
      });
      return false;
    }
  };

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

    // Request microphone permission first
    if (permissionStatus !== 'granted') {
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        return;
      }
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    // Remove 'auto' - let browser use default language
    recognition.lang = navigator.language || 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      console.log('Speech recognition started');
    };

    recognition.onresult = (event) => {
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
      console.error('Speech recognition error:', event.error);
      let errorMessage = "Voice recognition failed. Please try again.";
      
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        errorMessage = "Microphone access is required. Please check your browser permissions.";
        setPermissionStatus('denied');
      } else if (event.error === 'no-speech') {
        errorMessage = "No speech detected. Try speaking more clearly.";
      } else if (event.error === 'audio-capture') {
        errorMessage = "Couldn't capture audio. Check your microphone connection.";
      } else if (event.error === 'network') {
        errorMessage = "Network error. Check your internet connection.";
      }

      toast({
        title: "Voice Input Error",
        description: errorMessage,
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      setIsRecording(false);
      setIsProcessing(false);
      console.log('Speech recognition ended');
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleRetryPermission = async () => {
    await requestMicrophonePermission();
  };

  if (permissionStatus === 'denied') {
    return (
      <div className="flex flex-col items-center gap-2">
        <Button
          onClick={handleRetryPermission}
          disabled={isDisabled}
          variant="outline"
          className="flex items-center gap-2 border-orange-300 text-orange-600 hover:bg-orange-50"
        >
          <AlertCircle className="h-4 w-4" />
          Grant Microphone Access
        </Button>
        <p className="text-xs text-gray-500 text-center max-w-48">
          Microphone permission is required for voice input
        </p>
      </div>
    );
  }

  return (
    <Button
      onClick={isRecording ? stopRecording : startRecording}
      disabled={isDisabled || isProcessing}
      variant={isRecording ? "destructive" : "outline"}
      className="flex items-center gap-2"
    >
      {isProcessing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isRecording ? (
        <MicOff className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
      {isRecording ? 'Stop Recording' : 'Voice Input'}
    </Button>
  );
};

export default VoiceInput;
