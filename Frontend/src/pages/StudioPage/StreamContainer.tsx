import { useRef, useEffect, useState } from 'react';
import { StreamCanvas } from './StreamCanvas';
import { DrawCanvas } from './DrawCanvas';
import { WebRTCStream } from './WebRTCStream';
import { Position, StreamContainerProps } from '@/types/canvas';

export default function StreamContainer({
  screenStream,
  mediaStream,
  isStreaming,
  webrtcUrl,
  streamKey,
  onStreamError,
  drawingState,
}: StreamContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const streamCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const webrtcRef = useRef<WebRTCStream | null>(null);

  const [screenPosition, setScreenPosition] = useState<Position>({ x: 0, y: 0, width: 0, height: 0 });
  const [camPosition, setCamPosition] = useState<Position>({ x: 0, y: 0, width: 240, height: 180 });

  useEffect(() => {
    if (screenStream && containerRef.current) {
      const videoTrack = screenStream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      const aspectRatio = settings.width && settings.height ? settings.width / settings.height : 16 / 9;

      const updateScreenPosition = () => {
        if (!containerRef.current) return;

        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;

        let width = containerWidth;
        let height = width / aspectRatio;

        if (height > containerHeight) {
          height = containerHeight;
          width = height * aspectRatio;
        }

        setScreenPosition({
          x: (containerWidth - width) / 2,
          y: (containerHeight - height) / 2,
          width,
          height,
        });
      };

      updateScreenPosition();
      window.addEventListener('resize', updateScreenPosition);

      return () => {
        window.removeEventListener('resize', updateScreenPosition);
      };
    }
  }, [screenStream]);

  useEffect(() => {
    if (mediaStream && containerRef.current) {
      const videoTrack = mediaStream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      const trackAspectRatio = settings.width && settings.height ? settings.width / settings.height : 4 / 3;

      const updateCamPosition = () => {
        if (!containerRef.current) return;

        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;

        const width = Math.min(240, containerWidth * 0.2);
        const height = width / trackAspectRatio;

        const x = containerWidth - width - 20;
        const y = containerHeight - height - 20;

        setCamPosition({ x, y, width, height });
      };

      updateCamPosition();
      window.addEventListener('resize', updateCamPosition);

      return () => {
        window.removeEventListener('resize', updateCamPosition);
      };
    }
  }, [mediaStream]);

  useEffect(() => {
    if (!webrtcRef.current && webrtcUrl && streamKey) {
      webrtcRef.current = new WebRTCStream(webrtcUrl, streamKey);
    }

    return () => {
      if (webrtcRef.current) {
        webrtcRef.current.stop();
        webrtcRef.current = null;
      }
    };
  }, [webrtcUrl, streamKey]);

  useEffect(() => {
    const startStreaming = async () => {
      const streamCanvas = streamCanvasRef.current;
      const drawCanvas = drawCanvasRef.current;

      if (!streamCanvas || !drawCanvas || !webrtcRef.current) return;

      try {
        await webrtcRef.current.start(streamCanvas, drawCanvas, screenStream, mediaStream);
      } catch (error) {
        console.error('Streaming failed:', error);
        onStreamError?.(error as Error);
      }
    };

    if (isStreaming) {
      startStreaming();
    } else {
      webrtcRef.current?.stop();
    }
  }, [isStreaming, screenStream, mediaStream, onStreamError]);

  const getIsCamFlipped = () => {
    if (!mediaStream) return false;
    return (mediaStream as any).isCamFlipped || false;
  };

  return (
    <div ref={containerRef} className="canvas-container relative h-full w-full bg-black">
      <StreamCanvas
        ref={streamCanvasRef}
        screenStream={screenStream}
        mediaStream={mediaStream}
        screenPosition={screenPosition}
        camPosition={camPosition}
        getIsCamFlipped={getIsCamFlipped}
      />
      <DrawCanvas ref={drawCanvasRef} drawingState={drawingState} />
    </div>
  );
}
