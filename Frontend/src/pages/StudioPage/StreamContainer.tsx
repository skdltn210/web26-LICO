import { useState, useRef, useEffect } from 'react';
import StreamCanvas from './StreamCanvas';
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
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const webrtcRef = useRef<WebRTCStream | null>(null);
  const [streamCanvas, setStreamCanvas] = useState<HTMLCanvasElement | null>(null);

  const isDrawingMode = drawingState.isDrawing || drawingState.isTexting || drawingState.isErasing;

  const handleCanvasUpdate = (canvas: HTMLCanvasElement) => {
    setStreamCanvas(canvas);
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
      if (!streamCanvas || !drawCanvasRef.current || !webrtcRef.current) return;

      try {
        await webrtcRef.current.start(streamCanvas, drawCanvasRef.current, screenStream, mediaStream);
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
  }, [isStreaming, screenStream, mediaStream, onStreamError, streamCanvas]);

  return (
    <div ref={containerRef} className="relative h-full w-full bg-black">
      <div className="relative h-full w-full">
        <StreamCanvas
          screenStream={screenStream}
          mediaStream={mediaStream}
          onCanvasUpdate={handleCanvasUpdate}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: '100%',
            zIndex: isDrawingMode ? 1 : 3,
            pointerEvents: isDrawingMode ? 'none' : 'auto',
          }}
        />

        <DrawCanvas
          ref={drawCanvasRef}
          drawingState={drawingState}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: '100%',
            zIndex: isDrawingMode ? 3 : 1,
            pointerEvents: isDrawingMode ? 'auto' : 'none',
            background: 'transparent',
          }}
        />
      </div>
    </div>
  );
}
