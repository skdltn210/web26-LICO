import { useState, useEffect, useRef } from 'react';

interface MediaSettings {
  videoEnabled: boolean;
  audioEnabled: boolean;
  videoDeviceId?: string;
  audioDeviceId?: string;
  isFlipped?: boolean;
  volume?: number;
}

export function useMediaStream(settings: MediaSettings | null, isStreaming = false) {
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    const setupMediaStream = async () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        setMediaStream(null);
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      if (settings && !isStreaming && (settings.videoEnabled || settings.audioEnabled)) {
        try {
          const constraints = {
            video: settings.videoEnabled ? { deviceId: settings.videoDeviceId } : false,
            audio: settings.audioEnabled ? { deviceId: settings.audioDeviceId } : false,
          };

          const stream = await navigator.mediaDevices.getUserMedia(constraints);

          if (settings.audioEnabled && settings.volume !== undefined) {
            audioContextRef.current = new AudioContext();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            gainNodeRef.current = audioContextRef.current.createGain();
            gainNodeRef.current.gain.value = settings.volume / 100;
            source.connect(gainNodeRef.current);
            gainNodeRef.current.connect(audioContextRef.current.destination);
          }

          setMediaStream(stream);
        } catch (err) {
          console.error('Error accessing media devices:', err);
        }
      }
    };

    setupMediaStream();

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [settings?.videoEnabled, settings?.audioEnabled, settings?.videoDeviceId, settings?.audioDeviceId, isStreaming]);

  useEffect(() => {
    if (gainNodeRef.current && settings?.volume !== undefined) {
      gainNodeRef.current.gain.value = settings.volume / 100;
    }
  }, [settings?.volume]);

  return { mediaStream, audioContextRef, gainNodeRef };
}
