import { useRef, useEffect } from 'react';
import { StreamCanvas } from './StreamCanvas';
import { DrawCanvas } from './DrawCanvas';
import { InteractionCanvas } from './InteractionCanvas';
import { WebRTCStream } from './WebRTCStream';
import { useStudioStore } from '@store/useStudioStore';

interface StreamContainerProps {
  webrtcUrl: string;
  streamKey: string;
  onStreamError?: (error: Error) => void;
}

export default function StreamContainer({ webrtcUrl, streamKey, onStreamError }: StreamContainerProps) {
  const streamCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const interactionCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const webrtcRef = useRef<WebRTCStream | null>(null);

  const drawingState = useStudioStore(state => state.drawingState);
  const isStreaming = useStudioStore(state => state.isStreaming);

  const isDrawingMode = drawingState.isDrawing || drawingState.isTexting || drawingState.isErasing;

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
      if (!streamCanvasRef.current || !drawCanvasRef.current || !interactionCanvasRef.current || !webrtcRef.current)
        return;

      try {
        await webrtcRef.current.start({
          streamCanvas: streamCanvasRef.current,
          drawCanvas: drawCanvasRef.current,
          interactionCanvas: interactionCanvasRef.current,
          containerWidth: containerRef.current?.clientWidth || 0,
          containerHeight: containerRef.current?.clientHeight || 0,
        });
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
  }, [isStreaming]);

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <StreamCanvas ref={streamCanvasRef} />
      <DrawCanvas ref={drawCanvasRef} drawingState={drawingState} isDrawingMode={isDrawingMode} />
      <InteractionCanvas ref={interactionCanvasRef} isDrawingMode={isDrawingMode} />
    </div>
  );
}
