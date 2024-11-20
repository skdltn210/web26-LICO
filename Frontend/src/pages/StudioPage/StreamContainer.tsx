import { useEffect, useRef, useState } from 'react';
import { useCanvasElement } from '@hooks/useCanvasElement';
import { WebRTCStream } from './WebRTCStream';

interface StreamContainerProps {
  screenStream: MediaStream | null;
  mediaStream: MediaStream | null;
  isStreaming: boolean;
  webrtcUrl: string;
  streamKey: string;
  onStreamError?: (error: Error) => void;
}

interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
}

type SelectedElement = 'screen' | 'camera' | null;

export default function StreamContainer({
  screenStream,
  mediaStream,
  isStreaming,
  webrtcUrl,
  streamKey,
  onStreamError,
}: StreamContainerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const mediaVideoRef = useRef<HTMLVideoElement>(null);
  const webrtcRef = useRef<WebRTCStream | null>(null);
  const animationFrameRef = useRef<number>();

  const [screenAspectRatio, setScreenAspectRatio] = useState(16 / 9);
  const [cameraAspectRatio, setCameraAspectRatio] = useState(4 / 3);
  const [screenPosition, setScreenPosition] = useState<Position>({ x: 0, y: 0, width: 100, height: 100 });
  const [camPosition, setCamPosition] = useState<Position>({ x: 20, y: 20, width: 240, height: 180 });
  const [selectedElement, setSelectedElement] = useState<SelectedElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const getIsCamFlipped = () => {
    if (!mediaStream) return false;
    return (mediaStream as any).isCamFlipped || false;
  };

  const canvas = canvasRef.current;
  const {
    drawResizeHandles,
    getResizeHandle,
    getResizeCursor,
    handleResizeStart,
    handleResize,
    handleResizeEnd,
    isResizing,
  } = useCanvasElement({
    minSize: selectedElement === 'camera' ? 100 : 200,
    canvasWidth: canvas?.width || 0,
    canvasHeight: canvas?.height || 0,
  });

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
      if (!canvasRef.current || !webrtcRef.current) return;

      try {
        await webrtcRef.current.start(canvasRef.current, screenStream, mediaStream);
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

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const isClickedCamera = mediaStream && isPointInElement(x, y, camPosition);
      const isClickedScreen = screenStream && isPointInElement(x, y, screenPosition);

      if (!isClickedCamera && !isClickedScreen) {
        setSelectedElement(null);
        setIsDragging(false);
        handleResizeEnd();
      }
    };

    window.addEventListener('mousedown', handleGlobalClick);
    return () => window.removeEventListener('mousedown', handleGlobalClick);
  }, [mediaStream, screenStream, camPosition, screenPosition, handleResizeEnd]);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging && !isResizing) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const maxWidth = canvas.width / 2;
      const maxHeight = canvas.height / 2;

      if (selectedElement) {
        if (isResizing) {
          const newPosition = handleResize(x, y, selectedElement === 'camera' ? camPosition : screenPosition);
          if (newPosition) {
            const adjustedPosition = maintainAspectRatio(newPosition, selectedElement === 'camera');
            const setPosition = selectedElement === 'camera' ? setCamPosition : setScreenPosition;
            setPosition({
              ...adjustedPosition,
              x: Math.max(0, Math.min(adjustedPosition.x, maxWidth - adjustedPosition.width)),
              y: Math.max(0, Math.min(adjustedPosition.y, maxHeight - adjustedPosition.height)),
              width: Math.min(adjustedPosition.width, maxWidth),
              height: Math.min(adjustedPosition.height, maxHeight),
            });
          }
        } else if (isDragging) {
          const setPosition = selectedElement === 'camera' ? setCamPosition : setScreenPosition;
          const newX = x - dragStart.x;
          const newY = y - dragStart.y;

          setPosition(prev => ({
            ...prev,
            x: Math.max(0, Math.min(maxWidth - prev.width, newX)),
            y: Math.max(0, Math.min(maxHeight - prev.height, newY)),
          }));
        }
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      handleResizeEnd();
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, isResizing, selectedElement, handleResize, handleResizeEnd, camPosition, screenPosition, dragStart]);

  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
      screenVideoRef.current.onloadedmetadata = () => {
        const video = screenVideoRef.current;
        if (video) {
          setScreenAspectRatio(video.videoWidth / video.videoHeight);

          const container = canvasRef.current?.parentElement;
          if (container) {
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;
            const videoAspectRatio = video.videoWidth / video.videoHeight;

            let width = containerWidth;
            let height = containerWidth / videoAspectRatio;

            if (height > containerHeight) {
              height = containerHeight;
              width = height * videoAspectRatio;
            }

            setScreenPosition({
              x: (containerWidth - width) / 2,
              y: (containerHeight - height) / 2,
              width,
              height,
            });
          }
        }
      };
    }
  }, [screenStream]);

  useEffect(() => {
    if (mediaVideoRef.current && mediaStream) {
      mediaVideoRef.current.srcObject = mediaStream;
      mediaVideoRef.current.onloadedmetadata = () => {
        const video = mediaVideoRef.current;
        if (video) {
          setCameraAspectRatio(video.videoWidth / video.videoHeight);

          const width = 240;
          const height = width / (video.videoWidth / video.videoHeight);
          setCamPosition(prev => ({
            ...prev,
            width,
            height,
          }));
        }
      };
    }
  }, [mediaStream]);

  const maintainAspectRatio = (newPosition: Position, isCamera: boolean) => {
    const aspectRatio = isCamera ? cameraAspectRatio : screenAspectRatio;
    const width = newPosition.width;
    const height = width / aspectRatio;

    return {
      ...newPosition,
      height,
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { alpha: false });
    const screenVideo = screenVideoRef.current;
    const mediaVideo = mediaVideoRef.current;

    if (!canvas || !ctx) return;

    ctx.imageSmoothingEnabled = false;

    const updateCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        const scale = window.devicePixelRatio;
        canvas.width = container.clientWidth * scale;
        canvas.height = container.clientHeight * scale;
        ctx.scale(scale, scale);

        canvas.style.width = `${container.clientWidth}px`;
        canvas.style.height = `${container.clientHeight}px`;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (screenVideo && screenStream) {
        ctx.drawImage(screenVideo, screenPosition.x, screenPosition.y, screenPosition.width, screenPosition.height);
        if (selectedElement === 'screen') {
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.strokeRect(screenPosition.x, screenPosition.y, screenPosition.width, screenPosition.height);
          drawResizeHandles(ctx, screenPosition);
        }
      }

      if (mediaVideo && mediaStream && mediaStream.getVideoTracks().length > 0) {
        ctx.save();
        if (getIsCamFlipped()) {
          ctx.translate(camPosition.x + camPosition.width, camPosition.y);
          ctx.scale(-1, 1);
          ctx.drawImage(mediaVideo, 0, 0, camPosition.width, camPosition.height);
        } else {
          ctx.drawImage(mediaVideo, camPosition.x, camPosition.y, camPosition.width, camPosition.height);
        }
        ctx.restore();

        if (selectedElement === 'camera') {
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.strokeRect(camPosition.x, camPosition.y, camPosition.width, camPosition.height);
          drawResizeHandles(ctx, camPosition);
        }
      }

      animationFrameRef.current = requestAnimationFrame(updateCanvas);
    };

    animationFrameRef.current = requestAnimationFrame(updateCanvas);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [screenStream, mediaStream, camPosition, screenPosition, selectedElement, drawResizeHandles, getIsCamFlipped]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedElement) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const currentPosition = selectedElement === 'camera' ? camPosition : screenPosition;

    const resizeHandle = getResizeHandle(x, y, currentPosition);
    canvas.style.cursor = resizeHandle
      ? getResizeCursor(resizeHandle)
      : isPointInElement(x, y, currentPosition)
        ? 'move'
        : 'default';
  };

  const isPointInElement = (x: number, y: number, position: Position): boolean => {
    return x >= position.x && x <= position.x + position.width && y >= position.y && y <= position.y + position.height;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const currentPosition = selectedElement === 'camera' ? camPosition : screenPosition;

    if (selectedElement) {
      const resizeStarted = handleResizeStart(x, y, currentPosition);
      if (resizeStarted) return;
    }

    if (mediaStream && isPointInElement(x, y, camPosition)) {
      setSelectedElement('camera');
      setIsDragging(true);
      setDragStart({
        x: x - camPosition.x,
        y: y - camPosition.y,
      });
    } else if (screenStream && isPointInElement(x, y, screenPosition)) {
      setSelectedElement('screen');
      setIsDragging(true);
      setDragStart({
        x: x - screenPosition.x,
        y: y - screenPosition.y,
      });
    }
  };

  return (
    <div className="relative h-full w-full bg-black">
      <canvas ref={canvasRef} className="h-full w-full" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} />
      <video ref={screenVideoRef} autoPlay playsInline className="hidden" />
      <video ref={mediaVideoRef} autoPlay playsInline className="hidden" />
    </div>
  );
}
