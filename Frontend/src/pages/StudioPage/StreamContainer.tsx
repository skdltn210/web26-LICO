import { useState, useRef, useEffect } from 'react';
import { StreamCanvas } from './StreamCanvas';
import { DrawCanvas } from './DrawCanvas';
import { InteractionCanvas } from './InteractionCanvas';
import { WebRTCStream } from './WebRTCStream';
import { StreamContainerProps, Position } from '@/types/canvas';

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
  const interactionCanvasRef = useRef<HTMLCanvasElement>(null);
  const compositeCanvasRef = useRef<HTMLCanvasElement>(null);
  const webrtcRef = useRef<WebRTCStream | null>(null);
  const animationFrameRef = useRef<number>();

  const [screenPosition, setScreenPosition] = useState<Position>({ x: 0, y: 0, width: 792, height: 446 });
  const [camPosition, setCamPosition] = useState<Position>({ x: 20, y: 20, width: 240, height: 180 });

  const isDrawingMode = drawingState.isDrawing || drawingState.isTexting || drawingState.isErasing;

  const updateCompositeCanvas = () => {
    const streamCanvas = streamCanvasRef.current;
    const drawCanvas = drawCanvasRef.current;
    const interactionCanvas = interactionCanvasRef.current;
    const compositeCanvas = compositeCanvasRef.current;
    const container = containerRef.current;

    if (!streamCanvas || !drawCanvas || !interactionCanvas || !compositeCanvas || !container) return;

    const ctx = compositeCanvas.getContext('2d');
    if (!ctx) return;

    const width = container.clientWidth / 2;
    const height = container.clientHeight / 2;

    compositeCanvas.width = width;
    compositeCanvas.height = height;

    ctx.drawImage(streamCanvas, 0, 0, width, height, 0, 0, width, height);
    ctx.drawImage(drawCanvas, 0, 0, width, height, 0, 0, width, height);
    ctx.drawImage(interactionCanvas, 0, 0, width, height, 0, 0, width, height);

    animationFrameRef.current = requestAnimationFrame(updateCompositeCanvas);
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

  useEffect(() => {
    const startStreaming = async () => {
      if (!compositeCanvasRef.current || !webrtcRef.current) return;

      try {
        await webrtcRef.current.start(compositeCanvasRef.current);
      } catch (error) {
        console.error('Streaming failed:', error);
        onStreamError?.(error as Error);
      }
    };

    if (isStreaming) {
      startStreaming();
      animationFrameRef.current = requestAnimationFrame(updateCompositeCanvas);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      webrtcRef.current?.stop();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isStreaming]);

  return (
    <>
      <div ref={containerRef} className="relative h-full w-full">
        <StreamCanvas
          ref={streamCanvasRef}
          screenStream={screenStream}
          mediaStream={mediaStream}
          screenPosition={screenPosition}
          camPosition={camPosition}
        />
        {/* <DrawCanvas
          ref={drawCanvasRef}
          drawingState={drawingState}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: '100%',
            zIndex: 2,
            pointerEvents: isDrawingMode ? 'auto' : 'none',
            background: 'transparent',
          }}
        /> */}
        <InteractionCanvas
          ref={interactionCanvasRef}
          screenStream={screenStream}
          mediaStream={mediaStream}
          screenPosition={screenPosition}
          camPosition={camPosition}
          setScreenPosition={setScreenPosition}
          setCamPosition={setCamPosition}
          isDrawingMode={isDrawingMode}
        />
        <canvas ref={compositeCanvasRef} className="absolute left-0 top-0 hidden h-full w-full" style={{ zIndex: 0 }} />
      </div>
    </>
  );
}
