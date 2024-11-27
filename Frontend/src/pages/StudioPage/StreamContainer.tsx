import { useRef, useEffect } from 'react';
import { StreamCanvas } from './StreamCanvas';
import { DrawCanvas } from './DrawCanvas';
import { WebRTCStream } from './WebRTCStream';
import { StreamContainerProps } from '@/types/canvas';

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

  return (
    <div ref={containerRef} className="canvas-container relative h-full w-full bg-black">
      <div className="absolute inset-0" style={{ zIndex: 1 }}>
        <StreamCanvas ref={streamCanvasRef} screenStream={screenStream} mediaStream={mediaStream} />
      </div>
      <div
        className="absolute inset-0"
        style={{
          zIndex: 2,
          pointerEvents: drawingState.isDrawing || drawingState.isTexting || drawingState.isErasing ? 'auto' : 'none',
        }}
      >
        <DrawCanvas ref={drawCanvasRef} drawingState={drawingState} />
      </div>
    </div>
  );
}
