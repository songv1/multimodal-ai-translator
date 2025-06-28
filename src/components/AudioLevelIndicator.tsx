
import React, { useEffect, useState, useRef } from 'react';

interface AudioLevelIndicatorProps {
  isRecording: boolean;
}

const AudioLevelIndicator: React.FC<AudioLevelIndicatorProps> = ({ isRecording }) => {
  const [audioLevel, setAudioLevel] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRecording) {
      startAudioLevelDetection();
    } else {
      stopAudioLevelDetection();
    }

    return () => {
      stopAudioLevelDetection();
    };
  }, [isRecording]);

  const startAudioLevelDetection = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateAudioLevel = () => {
        if (analyserRef.current && isRecording) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / bufferLength;
          setAudioLevel(average / 255); // Normalize to 0-1
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };

      updateAudioLevel();
    } catch (error) {
      console.error('Failed to start audio level detection:', error);
    }
  };

  const stopAudioLevelDetection = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
  };

  const bars = Array.from({ length: 8 }, (_, i) => {
    const barHeight = Math.max(0.1, audioLevel * (i + 1) / 8);
    return (
      <div
        key={i}
        className="w-1 bg-blue-500 rounded-full transition-all duration-75"
        style={{ 
          height: `${barHeight * 100}%`,
          minHeight: '2px'
        }}
      />
    );
  });

  return (
    <div className="flex items-end justify-center gap-1 h-8 w-16">
      {bars}
    </div>
  );
};

export default AudioLevelIndicator;
