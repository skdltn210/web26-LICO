import { useEffect, useRef } from 'react';
import CanvasContainer from '@components/common/CanvasContainer';
import { useMediaStream } from '@hooks/useMediaStream';

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
  const { mediaStream } = useMediaStream(mediaSettings, isStreaming);

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
    if (camVideoRef.current) {
      camVideoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

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
