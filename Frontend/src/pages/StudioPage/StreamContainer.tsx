import { useState, useEffect, useRef } from 'react';
import CanvasContainer from '@components/common/CanvasContainer';

interface MediaSettings {
  videoEnabled: boolean;
  audioEnabled: boolean;
  videoDeviceId?: string;
  audioDeviceId?: string;
  isFlipped?: boolean;
  volume?: number;
}

interface StreamContainerProps {
  screenStream: MediaStream | null;
  setScreenStream: (stream: MediaStream | null) => void;
  mediaSettings: MediaSettings | null;
  isStreaming: boolean;
}

export default function StreamContainer({
  screenStream,
  setScreenStream,
  mediaSettings,
  isStreaming,
}: StreamContainerProps) {
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const camVideoRef = useRef<HTMLVideoElement>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
    } else if (!screenStream && screenVideoRef.current) {
      screenVideoRef.current.srcObject = null;
    }

    return () => {
      if (screenStream && !screenVideoRef.current?.srcObject) {
        screenStream.getTracks().forEach(track => track.stop());
        setScreenStream(null);
      }
    };
  }, [screenStream, setScreenStream]);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

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

      if (mediaSettings && !isStreaming && (mediaSettings.videoEnabled || mediaSettings.audioEnabled)) {
        try {
          const constraints = {
            video: mediaSettings.videoEnabled ? { deviceId: mediaSettings.videoDeviceId } : false,
            audio: mediaSettings.audioEnabled ? { deviceId: mediaSettings.audioDeviceId } : false,
          };

          const stream = await navigator.mediaDevices.getUserMedia(constraints);

          if (mediaSettings.audioEnabled && mediaSettings.volume !== undefined) {
            audioContextRef.current = new AudioContext();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            gainNodeRef.current = audioContextRef.current.createGain();

            gainNodeRef.current.gain.value = mediaSettings.volume / 100;

            source.connect(gainNodeRef.current);
            gainNodeRef.current.connect(audioContextRef.current.destination);
          }

          if (camVideoRef.current) {
            camVideoRef.current.srcObject = stream;
            setMediaStream(stream);
          }
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
    };
  }, [mediaSettings, isStreaming]);

  useEffect(() => {
    if (gainNodeRef.current && mediaSettings?.volume !== undefined) {
      gainNodeRef.current.gain.value = mediaSettings.volume / 100;
    }
  }, [mediaSettings?.volume]);

  return (
    <div className="relative h-full w-full bg-black">
      <video ref={screenVideoRef} autoPlay playsInline className="absolute left-0 top-0 h-full w-full object-contain" />
      {mediaSettings?.videoEnabled && (
        <CanvasContainer>
          <video
            ref={camVideoRef}
            autoPlay
            playsInline
            className={`h-full w-full object-cover ${mediaSettings.isFlipped ? 'scale-x-[-1]' : ''}`}
            data-drag-handle="true"
          />
        </CanvasContainer>
      )}
    </div>
  );
}
