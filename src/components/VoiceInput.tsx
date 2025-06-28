
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
  const [currentTranscript, setCurrentTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const SILENCE_DURATION = 5000; // 5 seconds of silence
  const TRANSCRIPT_DELAY = 1500; // 1.5 seconds delay before sending for translation

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
    setCurrentTranscript('');

    // Step 1: Get microphone permissions first
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone permission granted');
    } catch (error) {
      console.error('Microphone permission denied:', error);
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access to use voice input.",
        variant: "destructive",
      });
      return;
    }

    // Step 2: Start recording audio with continuous transcription
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true; // Keep listening continuously
    recognition.interimResults = true; // Get real-time results
    recognition.lang = navigator.language || 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      console.log('Speech recognition started - continuous transcription active');
      
      toast({
        title: "Recording Started",
        description: "Speak now. Real-time translation will begin shortly.",
      });
    };

    // Step 3: Handle real-time transcription and translation
    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      // Reset silence timeout since we received speech
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }

      // Clear any pending transcript timeout
      if (transcriptTimeoutRef.current) {
        clearTimeout(transcriptTimeoutRef.current);
      }

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Update current transcript with both final and interim results
      const fullTranscript = finalTranscript + interimTranscript;
      setCurrentTranscript(fullTranscript);
      console.log('Real-time transcript:', fullTranscript);

      // Send for real-time translation if we have substantial content
      if (fullTranscript.trim().length > 10) {
        // Debounce the translation calls to avoid too many API requests
        transcriptTimeoutRef.current = setTimeout(() => {
          console.log('Sending real-time transcript for translation:', fullTranscript.trim());
          onTranscription(fullTranscript.trim());
        }, TRANSCRIPT_DELAY);
      }

      // Start silence detection timer
      silenceTimeoutRef.current = setTimeout(() => {
        console.log('5 seconds of silence detected, stopping recording');
        stopRecording();
      }, SILENCE_DURATION);
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
      if (transcriptTimeoutRef.current) {
        clearTimeout(transcriptTimeoutRef.current);
        transcriptTimeoutRef.current = null;
      }
      setIsRecording(false);
      console.log('Speech recognition ended');

      // Send final transcript for translation if we haven't sent it yet
      if (currentTranscript.trim()) {
        console.log('Sending final transcript for translation:', currentTranscript.trim());
        onTranscription(currentTranscript.trim());
        toast({
          title: "Recording Complete",
          description: "Final transcript sent for translation.",
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
  };

  // Step 4: Stop recording manually
  const stopRecording = () => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    
    if (transcriptTimeoutRef.current) {
      clearTimeout(transcriptTimeoutRef.current);
      transcriptTimeoutRef.current = null;
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleRetry = () => {
    setHasError(false);
    setCurrentTranscript('');
    startRecording();
  };

  if (hasError) {
    return (
      <Button
        onClick={handleRetry}
        disabled={isDisabled}
        variant="outline"
        size="icon"
        className="border-orange-300 text-orange-600 hover:bg-orange-50"
      >
        <AlertCircle className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      onClick={isRecording ? stopRecording : startRecording}
      disabled={isDisabled}
      variant={isRecording ? "destructive" : "outline"}
      size="icon"
      className="relative"
    >
      {isRecording ? (
        <MicOff className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
      {isRecording && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      )}
    </Button>
  );
};

export default VoiceInput;
