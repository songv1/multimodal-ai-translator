
import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseSpeechRecognitionProps {
  onTranscription: (text: string) => void;
  silenceDuration?: number;
}

export const useSpeechRecognition = ({ 
  onTranscription, 
  silenceDuration = 5000 
}: UseSpeechRecognitionProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const checkSpeechRecognitionSupport = useCallback(() => {
    return ('webkitSpeechRecognization' in window) || ('SpeechRecognition' in window);
  }, []);

  const requestMicrophonePermission = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone permission granted');
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access to use voice input.",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const stopRecording = useCallback(() => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (!checkSpeechRecognitionSupport()) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Try using Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }

    setHasError(false);
    setCurrentTranscript('');

    if (!(await requestMicrophonePermission())) {
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      console.log('Speech recognition started - continuous transcription active');
      
      toast({
        title: "Recording Started",
        description: "Speak now. Recording will stop after 5 seconds of silence.",
      });
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const fullTranscript = finalTranscript + interimTranscript;
      setCurrentTranscript(fullTranscript);
      console.log('Real-time transcript:', fullTranscript);

      silenceTimeoutRef.current = setTimeout(() => {
        console.log('5 seconds of silence detected, stopping recording');
        stopRecording();
      }, silenceDuration);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setHasError(true);
      
      let errorMessage = "Voice recognition failed. Please try again.";
      
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        errorMessage = "Microphone access denied. Please allow microphone access and try again.";
      } else if (event.error === 'no-speech') {
        errorMessage = "No speech detected. Please speak more clearly.";
        setHasError(false);
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
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
      setIsRecording(false);
      console.log('Speech recognition ended');

      if (currentTranscript.trim()) {
        onTranscription(currentTranscript.trim());
        toast({
          title: "Recording Complete",
          description: "Audio transcribed successfully. Ready for translation.",
        });
      }
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
  }, [checkSpeechRecognitionSupport, requestMicrophonePermission, onTranscription, currentTranscript, silenceDuration, stopRecording, toast]);

  const handleRetry = useCallback(() => {
    setHasError(false);
    setCurrentTranscript('');
    startRecording();
  }, [startRecording]);

  return {
    isRecording,
    hasError,
    currentTranscript,
    startRecording,
    stopRecording,
    handleRetry
  };
};
