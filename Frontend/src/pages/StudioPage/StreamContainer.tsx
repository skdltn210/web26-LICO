import { useRef, useEffect } from 'react';
import { StreamCanvas } from './Canvas/StreamCanvas';
import { ImageTextCanvas } from './Canvas/ImageTextCanvas';
import { DrawCanvas } from './Canvas/DrawCanvas';
import { InteractionCanvas } from './Canvas/InteractionCanvas';
import { WebRTCStream } from './WebRTCStream';
import { useStudioStore } from '@store/useStudioStore';

interface StreamContainerProps {
  webrtcUrl: string;
  streamKey: string;
  onStreamError?: (error: Error) => void;
}

export default function StreamContainer({ webrtcUrl, streamKey, onStreamError }: StreamContainerProps) {
  const streamCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageTextCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const interactionCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const webrtcRef = useRef<WebRTCStream | null>(null);
  const dimensionsRef = useRef<{ width: number; height: number } | null>(null);

  const drawingState = useStudioStore(state => state.drawingState);
  const isStreaming = useStudioStore(state => state.isStreaming);
  const screenStream = useStudioStore(state => state.screenStream);
  const mediaStream = useStudioStore(state => state.mediaStream);

  const isDrawingMode = drawingState.isDrawing || drawingState.isErasing;
  const isTextingMode = drawingState.isTexting;

  const getZIndexClasses = () => {
    if (isDrawingMode) {
      return {
        interaction: 'z-10',
        imageText: 'z-20',
        draw: 'z-30',
      };
    }
    if (isTextingMode) {
      return {
        interaction: 'z-10',
        draw: 'z-20',
        imageText: 'z-30',
      };
    }
    return {
      imageText: 'z-10',
      draw: 'z-20',
      interaction: 'z-30',
    };
  };

  const zIndexClasses = getZIndexClasses();

  const validateAudioStreams = () => {
    const hasScreenAudio = screenStream !== null && screenStream.getAudioTracks().length > 0;
    const hasMediaAudio = mediaStream !== null && mediaStream.getAudioTracks().length > 0;

    if (!hasScreenAudio && !hasMediaAudio) {
      throw new Error('At least one audio source (screen share or microphone) is required');
    }
  };

  const updateCanvasDimensions = () => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = (containerWidth * 9) / 16;

    if (dimensionsRef.current?.width === containerWidth && dimensionsRef.current?.height === containerHeight) {
      return;
    }

    dimensionsRef.current = { width: containerWidth, height: containerHeight };

    [streamCanvasRef, drawCanvasRef, interactionCanvasRef].forEach(canvasRef => {
      if (canvasRef.current) {
        canvasRef.current.width = containerWidth;
        canvasRef.current.height = containerHeight;
        canvasRef.current.style.width = `${containerWidth}px`;
        canvasRef.current.style.height = `${containerHeight}px`;
      }
    });

    containerRef.current.style.height = `${containerHeight}px`;
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
  }, []);

  useEffect(() => {
    const handleStreamingChange = async () => {
      if (isStreaming && dimensionsRef.current) {
        if (
          !streamCanvasRef.current ||
          !imageTextCanvasRef.current ||
          !drawCanvasRef.current ||
          !interactionCanvasRef.current ||
          !webrtcRef.current
        ) {
          return;
        }

        try {
          validateAudioStreams();

          await webrtcRef.current.start(
            {
              streamCanvas: streamCanvasRef.current,
              imageTextCanvas: imageTextCanvasRef.current,
              drawCanvas: drawCanvasRef.current,
              interactionCanvas: interactionCanvasRef.current,
              containerWidth: dimensionsRef.current.width,
              containerHeight: dimensionsRef.current.height,
            },
            screenStream,
            mediaStream,
          );
        } catch (error) {
          onStreamError?.(error as Error);
        }
      }
    };

    handleStreamingChange();
  }, [isStreaming, screenStream, mediaStream]);

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
      <ImageTextCanvas
        ref={imageTextCanvasRef}
        drawingState={drawingState}
        isDrawingMode={isDrawingMode}
        isTextingMode={isTextingMode}
        className={zIndexClasses.imageText}
      />
      <DrawCanvas
        ref={drawCanvasRef}
        drawingState={drawingState}
        isDrawingMode={isDrawingMode}
        isTextingMode={isTextingMode}
        className={zIndexClasses.draw}
      />
      <InteractionCanvas
        ref={interactionCanvasRef}
        isDrawingMode={isDrawingMode}
        isTextingMode={isTextingMode}
        className={zIndexClasses.interaction}
      />
    </div>
  );
}
