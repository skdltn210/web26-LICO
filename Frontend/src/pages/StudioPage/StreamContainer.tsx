import { useState, useEffect, useRef } from 'react';
import CanvasContainer from '@components/common/CanvasContainer';

interface StreamContainerProps {
  screenStream: MediaStream | null;
  setScreenStream: (stream: MediaStream | null) => void;
  camEnabled: boolean;
  isStreaming: boolean;
}

export default function StreamContainer({
  screenStream,
  setScreenStream,
  camEnabled,
  isStreaming,
}: StreamContainerProps) {
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const camVideoRef = useRef<HTMLVideoElement>(null);
  const [camStream, setCamStream] = useState<MediaStream | null>(null);

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
    if (camEnabled && !isStreaming && !camStream) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then(stream => {
          if (camVideoRef.current) {
            camVideoRef.current.srcObject = stream;
            setCamStream(stream);
          }
        })
        .catch(err => console.error('Error accessing camera:', err));
    }

    return () => {
      if (camStream && !camEnabled) {
        camStream.getTracks().forEach(track => track.stop());
        setCamStream(null);
      }
    };
  }, [camEnabled, isStreaming, camStream]);

  return (
    <div className="relative h-full w-full bg-black">
      <video ref={screenVideoRef} autoPlay playsInline className="absolute left-0 top-0 h-full w-full object-contain" />
      {camEnabled && (
        <CanvasContainer>
          <video
            ref={camVideoRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
            data-drag-handle="true"
          />
        </CanvasContainer>
      )}
    </div>
  );
}
