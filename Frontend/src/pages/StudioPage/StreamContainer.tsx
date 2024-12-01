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

  const updateCanvasDimensions = () => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = (containerWidth * 9) / 16;

    [streamCanvasRef, drawCanvasRef, interactionCanvasRef].forEach(canvasRef => {
      if (canvasRef.current) {
        canvasRef.current.width = containerWidth;
        canvasRef.current.height = containerHeight;
        canvasRef.current.style.width = `${containerWidth}px`;
        canvasRef.current.style.height = `${containerHeight}px`;
      }
    });

    containerRef.current.style.height = `${containerHeight}px`;

    if (isStreaming) {
      startStreaming(containerWidth, containerHeight);
    }
  };

  useEffect(() => {
    updateCanvasDimensions();

    const observer = new ResizeObserver(() => {
      updateCanvasDimensions();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [isStreaming]);

  const startStreaming = async (width: number, height: number) => {
    if (!streamCanvasRef.current || !drawCanvasRef.current || !interactionCanvasRef.current || !webrtcRef.current) {
      return;
    }

    try {
      await webrtcRef.current.start({
        streamCanvas: streamCanvasRef.current,
        drawCanvas: drawCanvasRef.current,
        interactionCanvas: interactionCanvasRef.current,
        containerWidth: width,
        containerHeight: height,
      });
    } catch (error) {
      onStreamError?.(error as Error);
    }
  };

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

  return (
    <div ref={containerRef} className="relative w-full">
      <StreamCanvas ref={streamCanvasRef} />
      <DrawCanvas ref={drawCanvasRef} drawingState={drawingState} isDrawingMode={isDrawingMode} />
      <InteractionCanvas ref={interactionCanvasRef} isDrawingMode={isDrawingMode} />
    </div>
  );
}
