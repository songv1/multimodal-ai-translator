
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AudioLevelIndicator from './AudioLevelIndicator';
import SilenceCountdown from './SilenceCountdown';
import RecordingStatus from './RecordingStatus';

interface VoiceInputProps {
  onTranscription: (text: string) => void;
  isDisabled: boolean;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscription, isDisabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [recordingStatus, setRecordingStatus] = useState<'waiting' | 'listening' | 'processing' | 'complete' | 'error'>('waiting');
  const [silenceRemaining, setSilenceRemaining] = useState(5000);
  const [showSilenceCountdown, setShowSilenceCountdown] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const silenceCountdownRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const SILENCE_DURATION = 5000; // 5 seconds of silence

  const startSilenceCountdown = () => {
    setSilenceRemaining(SILENCE_DURATION);
    setShowSilenceCountdown(true);
    
    const startTime = Date.now();
    
    const updateCountdown = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, SILENCE_DURATION - elapsed);
      setSilenceRemaining(remaining);
      
      if (remaining > 0) {
        silenceCountdownRef.current = setTimeout(updateCountdown, 100);
      } else {
        setShowSilenceCountdown(false);
      }
    };
    
    updateCountdown();
  };

  const stopSilenceCountdown = () => {
    if (silenceCountdownRef.current) {
      clearTimeout(silenceCountdownRef.current);
      silenceCountdownRef.current = null;
    }
    setShowSilenceCountdown(false);
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

    // Clear any previous error state
    setHasError(false);
    setCurrentTranscript('');
    setRecordingStatus('waiting');

    // Step 1: Get microphone permissions first
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone permission granted');
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setRecordingStatus('error');
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
      setRecordingStatus('listening');
      console.log('Speech recognition started - continuous transcription active');
      
      toast({
        title: "Recording Started",
        description: "Speak now. Recording will stop after 5 seconds of silence.",
      });
    };

    // Step 3: Handle real-time transcription
    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      // Reset silence timeout since we received speech
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      stopSilenceCountdown();

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

      // Start silence detection timer
      silenceTimeoutRef.current = setTimeout(() => {
        console.log('5 seconds of silence detected, stopping recording');
        stopRecording();
      }, SILENCE_DURATION);

      // Start visual countdown
      startSilenceCountdown();
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setHasError(true);
      setRecordingStatus('error');
      
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
      stopSilenceCountdown();
      setIsRecording(false);
      setRecordingStatus('processing');
      console.log('Speech recognition ended');

      // Step 5: Pass the final transcript for translation
      if (currentTranscript.trim()) {
        setRecordingStatus('complete');
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
      setRecordingStatus('error');
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
    stopSilenceCountdown();
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleRetry = () => {
    setHasError(false);
    setCurrentTranscript('');
    setRecordingStatus('waiting');
    startRecording();
  };

  if (hasError) {
    return (
      <div className="flex flex-col items-center gap-4">
        <RecordingStatus status="error" />
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
    <div className="flex flex-col items-center gap-4">
      <RecordingStatus status={recordingStatus} />
      
      <div className="flex items-center gap-4">
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
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </Button>
        
        {isRecording && <AudioLevelIndicator isRecording={isRecording} />}
      </div>
      
      <SilenceCountdown 
        remainingTime={silenceRemaining}
        totalTime={SILENCE_DURATION}
        isVisible={showSilenceCountdown}
      />
      
      {currentTranscript && (
        <div className="w-full max-w-md p-3 bg-blue-50 rounded-md border border-blue-200">
          <p className="text-xs text-blue-600 font-medium mb-1">Real-time transcript:</p>
          <p className="text-sm text-gray-800">{currentTranscript}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
