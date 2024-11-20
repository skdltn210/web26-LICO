import { useEffect, useRef } from 'react';
import CanvasContainer from '@/pages/StudioPage/StreamCanvas/CanvasContainer';

interface StreamContainerProps {
  screenStream: MediaStream | null;
  mediaStream: MediaStream | null;
  isCamFlipped: boolean;
  isStreaming: boolean;
}

export default function StreamContainer({
  screenStream,
  mediaStream,
  isCamFlipped,
  isStreaming,
}: StreamContainerProps) {
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const mediaVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  useEffect(() => {
    if (mediaVideoRef.current && mediaStream) {
      mediaVideoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  return (
    <div className="relative h-full w-full bg-black">
      {screenStream && (
        <CanvasContainer>
          <video
            ref={screenVideoRef}
            autoPlay
            playsInline
            className="absolute left-0 top-0 h-full w-full object-contain"
            data-drag-handle="true"
          />
        </CanvasContainer>
      )}
      {mediaStream && (
        <CanvasContainer>
          <video
            ref={mediaVideoRef}
            autoPlay
            playsInline
            className={`h-full w-full object-cover ${isCamFlipped ? 'scale-x-[-1]' : ''}`}
            data-drag-handle="true"
          />
        </CanvasContainer>
      )}
    </div>
  );
}
