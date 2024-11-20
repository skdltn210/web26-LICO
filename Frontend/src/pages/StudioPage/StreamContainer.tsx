import { useEffect, useRef, useState } from 'react';
import { useCanvasElement } from '@hooks/useCanvasElement';

interface StreamContainerProps {
  screenStream: MediaStream | null;
  mediaStream: MediaStream | null;
  isStreaming: boolean;
}

interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
}

type SelectedElement = 'screen' | 'camera' | null;

export default function StreamContainer({ screenStream, mediaStream, isStreaming }: StreamContainerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  const canvas = canvasRef.current;
  const { drawResizeHandles, getResizeHandle, getResizeCursor, handleResizeStart, handleResize, handleResizeEnd } =
    useCanvasElement({
      minSize: selectedElement === 'camera' ? 100 : 200,
      canvasWidth: canvas?.width || 0,
      canvasHeight: canvas?.height || 0,
    });

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

    return () => {
      window.removeEventListener('mousedown', handleGlobalClick);
    };
  }, [mediaStream, screenStream, camPosition, screenPosition, handleResizeEnd]);

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
  }, [screenStream, mediaStream, camPosition, screenPosition, selectedElement, drawResizeHandles]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const currentPosition = selectedElement === 'camera' ? camPosition : screenPosition;
    const setPosition = selectedElement === 'camera' ? setCamPosition : setScreenPosition;

    if (selectedElement) {
      const resizeHandle = getResizeHandle(x, y, currentPosition);
      canvas.style.cursor = resizeHandle
        ? getResizeCursor(resizeHandle)
        : isPointInElement(x, y, currentPosition)
          ? 'move'
          : 'default';

      if (resizeHandle) {
        const newPosition = handleResize(x, y, currentPosition);
        if (newPosition) {
          const adjustedPosition = maintainAspectRatio(newPosition, selectedElement === 'camera');
          setPosition(adjustedPosition);
          return;
        }
      }
    }

    if (isDragging && selectedElement) {
      const currentPosition = selectedElement === 'camera' ? camPosition : screenPosition;
      const newX = Math.max(0, Math.min(canvas.width - currentPosition.width, x - dragStart.x));
      const newY = Math.max(0, Math.min(canvas.height - currentPosition.height, y - dragStart.y));

      setPosition(prev => ({
        ...prev,
        x: newX,
        y: newY,
      }));
    }
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

  const handleMouseUp = () => {
    setIsDragging(false);
    handleResizeEnd();
  };

  return (
    <div className="relative h-full w-full bg-black">
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      <video ref={screenVideoRef} autoPlay playsInline className="hidden" />
      <video ref={mediaVideoRef} autoPlay playsInline className="hidden" />
    </div>
  );
}
