import { useEffect, useRef, useState } from 'react';
import { useCanvasElement } from '@hooks/canvas/useCanvasElement';
import { Position, Point } from '@/types/canvas';

type SelectedElement = 'screen' | 'camera' | null;

interface StreamCanvasProps {
  screenStream: MediaStream | null;
  mediaStream: MediaStream | null;
  onCanvasUpdate?: (canvas: HTMLCanvasElement) => void;
  style?: React.CSSProperties;
}

export default function StreamCanvas({ screenStream, mediaStream, onCanvasUpdate, style }: StreamCanvasProps) {
  const videoCanvasRef = useRef<HTMLCanvasElement>(null);
  const interactionCanvasRef = useRef<HTMLCanvasElement>(null);
  const compositeCanvasRef = useRef<HTMLCanvasElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const mediaVideoRef = useRef<HTMLVideoElement>(null);
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

  const maintainAspectRatio = (newPosition: Position, isCamera: boolean) => {
    const aspectRatio = isCamera ? cameraAspectRatio : screenAspectRatio;
    const width = newPosition.width;
    const height = width / aspectRatio;

    return {
      ...newPosition,
      height,
    };
  };

  const isPointInElement = (x: number, y: number, position: Position): boolean => {
    return x >= position.x && x <= position.x + position.width && y >= position.y && y <= position.y + position.height;
  };

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = interactionCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

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
    canvasWidth: interactionCanvasRef.current?.width || 0,
    canvasHeight: interactionCanvasRef.current?.height || 0,
  });

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);
    const currentPosition = selectedElement === 'camera' ? camPosition : screenPosition;

    if (selectedElement) {
      const resizeStarted = handleResizeStart(point.x, point.y, currentPosition);
      if (resizeStarted) return;
    }

    if (mediaStream && isPointInElement(point.x, point.y, camPosition)) {
      setSelectedElement('camera');
      setIsDragging(true);
      setDragStart({
        x: point.x - camPosition.x,
        y: point.y - camPosition.y,
      });
    } else if (screenStream && isPointInElement(point.x, point.y, screenPosition)) {
      setSelectedElement('screen');
      setIsDragging(true);
      setDragStart({
        x: point.x - screenPosition.x,
        y: point.y - screenPosition.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = interactionCanvasRef.current;
    if (!canvas) return;

    const point = getCanvasPoint(e);

    if (!selectedElement) {
      canvas.style.cursor = 'default';
      return;
    }

    const currentPosition = selectedElement === 'camera' ? camPosition : screenPosition;
    const resizeHandle = getResizeHandle(point.x, point.y, currentPosition);

    canvas.style.cursor = resizeHandle
      ? getResizeCursor(resizeHandle)
      : isPointInElement(point.x, point.y, currentPosition)
        ? 'move'
        : 'default';
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    handleResizeEnd();
  };

  const renderCompositeCanvas = () => {
    const compositeCanvas = compositeCanvasRef.current;
    const videoCanvas = videoCanvasRef.current;
    const interactionCanvas = interactionCanvasRef.current;

    if (!compositeCanvas || !videoCanvas || !interactionCanvas) return;

    const ctx = compositeCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, compositeCanvas.width, compositeCanvas.height);
    ctx.drawImage(videoCanvas, 0, 0);
    ctx.drawImage(interactionCanvas, 0, 0);

    onCanvasUpdate?.(compositeCanvas);
  };

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const canvas = interactionCanvasRef.current;
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

      const canvas = interactionCanvasRef.current;
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

          const container = interactionCanvasRef.current?.parentElement;
          if (container) {
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;
            const videoAspectRatio = video.videoWidth / video.videoHeight;

            let width = containerWidth;
            let height = width / videoAspectRatio;

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

  useEffect(() => {
    const videoCanvas = videoCanvasRef.current;
    const interactionCanvas = interactionCanvasRef.current;
    const compositeCanvas = compositeCanvasRef.current;
    const videoCtx = videoCanvas?.getContext('2d', { alpha: false });
    const interactionCtx = interactionCanvas?.getContext('2d', { alpha: true });
    const screenVideo = screenVideoRef.current;
    const mediaVideo = mediaVideoRef.current;

    if (!videoCanvas || !interactionCanvas || !compositeCanvas || !videoCtx || !interactionCtx) return;

    videoCtx.imageSmoothingEnabled = false;
    interactionCtx.imageSmoothingEnabled = false;

    const updateCanvas = () => {
      const container = videoCanvas.parentElement;
      if (!container) return;

      const scale = window.devicePixelRatio;
      const width = container.clientWidth * scale;
      const height = container.clientHeight * scale;

      [videoCanvas, interactionCanvas, compositeCanvas].forEach(canvas => {
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = `${container.clientWidth}px`;
        canvas.style.height = `${container.clientHeight}px`;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.scale(scale, scale);
      });

      videoCtx.clearRect(0, 0, width, height);
      videoCtx.fillStyle = 'black';
      videoCtx.fillRect(0, 0, width, height);

      if (screenVideo && screenStream) {
        videoCtx.drawImage(
          screenVideo,
          screenPosition.x,
          screenPosition.y,
          screenPosition.width,
          screenPosition.height,
        );
      }

      if (mediaVideo && mediaStream && mediaStream.getVideoTracks().length > 0) {
        videoCtx.save();
        if (getIsCamFlipped()) {
          videoCtx.translate(camPosition.x + camPosition.width, camPosition.y);
          videoCtx.scale(-1, 1);
          videoCtx.drawImage(mediaVideo, 0, 0, camPosition.width, camPosition.height);
        } else {
          videoCtx.drawImage(mediaVideo, camPosition.x, camPosition.y, camPosition.width, camPosition.height);
        }
        videoCtx.restore();
      }

      interactionCtx.clearRect(0, 0, width, height);
      if (selectedElement) {
        const currentPosition = selectedElement === 'camera' ? camPosition : screenPosition;
        interactionCtx.strokeStyle = 'white';
        interactionCtx.lineWidth = 2;
        interactionCtx.strokeRect(currentPosition.x, currentPosition.y, currentPosition.width, currentPosition.height);
        drawResizeHandles(interactionCtx, currentPosition);
      }

      renderCompositeCanvas();

      animationFrameRef.current = requestAnimationFrame(updateCanvas);
    };

    animationFrameRef.current = requestAnimationFrame(updateCanvas);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [screenStream, mediaStream, camPosition, screenPosition, selectedElement, drawResizeHandles, getIsCamFlipped]);

  return (
    <div className="relative h-full w-full bg-black">
      <canvas ref={videoCanvasRef} className="absolute left-0 top-0 h-full w-full" style={{ zIndex: 1 }} />

      <canvas
        ref={interactionCanvasRef}
        className="absolute left-0 top-0 h-full w-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          background: 'transparent',
          zIndex: style?.zIndex || 1,
          pointerEvents: style?.pointerEvents,
        }}
      />

      <canvas ref={compositeCanvasRef} className="absolute left-0 top-0 hidden h-full w-full" style={{ zIndex: 0 }} />

      <video ref={screenVideoRef} autoPlay playsInline className="hidden" />
      <video ref={mediaVideoRef} autoPlay playsInline className="hidden" />
    </div>
  );
}
