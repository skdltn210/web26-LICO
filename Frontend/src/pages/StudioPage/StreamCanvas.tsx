import { forwardRef, useEffect, useRef, useState } from 'react';
import { useCanvasElement } from '@/hooks/canvas/useCanvasElement';
import { Position, Point } from '@/types/canvas';

interface StreamCanvasProps {
  screenStream: MediaStream | null;
  mediaStream: MediaStream | null;
}

type SelectedElement = 'screen' | 'camera' | null;

export const StreamCanvas = forwardRef<HTMLCanvasElement, StreamCanvasProps>(({ screenStream, mediaStream }, ref) => {
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const mediaVideoRef = useRef<HTMLVideoElement>(null);
  const interactionCanvasRef = useRef<HTMLCanvasElement>(null);
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
    const interactionCanvas = interactionCanvasRef.current;
    if (!interactionCanvas) return { x: 0, y: 0 };

    const rect = interactionCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    return { x, y };
  };

  const interactionCanvas = interactionCanvasRef.current;
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
    canvasWidth: interactionCanvas?.width || 0,
    canvasHeight: interactionCanvas?.height || 0,
  });

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const interactionCanvas = interactionCanvasRef.current;
    if (!interactionCanvas) return;

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
      setDragStart({ x: point.x - screenPosition.x, y: point.y - screenPosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const interactionCanvas = interactionCanvasRef.current;
    if (!interactionCanvas) return;

    const point = getCanvasPoint(e);

    if (!selectedElement) {
      interactionCanvas.style.cursor = 'default';
      return;
    }

    const currentPosition = selectedElement === 'camera' ? camPosition : screenPosition;
    const resizeHandle = getResizeHandle(point.x, point.y, currentPosition);

    interactionCanvas.style.cursor = resizeHandle
      ? getResizeCursor(resizeHandle)
      : isPointInElement(point.x, point.y, currentPosition)
        ? 'move'
        : 'default';
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    handleResizeEnd();
  };

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const interactionCanvas = interactionCanvasRef.current;
      if (!interactionCanvas) return;

      const rect = interactionCanvas.getBoundingClientRect();
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

      const interactionCanvas = interactionCanvasRef.current;
      if (!interactionCanvas) return;

      const rect = interactionCanvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const maxWidth = interactionCanvas.width / 2;
      const maxHeight = interactionCanvas.height / 2;

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

  useEffect(() => {
    const interactionCanvas = interactionCanvasRef.current;
    const videoCanvas = (ref as React.RefObject<HTMLCanvasElement>).current;
    const interactionCtx = interactionCanvas?.getContext('2d', { alpha: true });
    const videoCtx = videoCanvas?.getContext('2d', { alpha: false });
    const screenVideo = screenVideoRef.current;
    const mediaVideo = mediaVideoRef.current;

    if (!interactionCanvas || !interactionCtx || !videoCanvas || !videoCtx) return;

    interactionCtx.imageSmoothingEnabled = false;
    videoCtx.imageSmoothingEnabled = false;

    const updateCanvas = () => {
      const container = interactionCanvas.parentElement as HTMLElement | null;
      if (!container) return;

      const scale = window.devicePixelRatio;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      const setCanvasSize = (canvas: HTMLCanvasElement) => {
        canvas.width = Math.floor(containerWidth * scale);
        canvas.height = Math.floor(containerHeight * scale);
        canvas.style.width = `${containerWidth}px`;
        canvas.style.height = `${containerHeight}px`;
      };

      setCanvasSize(interactionCanvas);
      setCanvasSize(videoCanvas);

      interactionCtx.setTransform(1, 0, 0, 1, 0, 0);
      videoCtx.setTransform(1, 0, 0, 1, 0, 0);

      interactionCtx.scale(scale, scale);
      videoCtx.scale(scale, scale);

      videoCtx.clearRect(0, 0, containerWidth * scale, containerHeight * scale);
      videoCtx.fillStyle = 'black';
      videoCtx.fillRect(0, 0, containerWidth * scale, containerHeight * scale);

      if (screenVideo && screenStream && screenVideo.videoWidth > 0) {
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

      interactionCtx.clearRect(0, 0, containerWidth * scale, containerHeight * scale);

      if (selectedElement) {
        const position = selectedElement === 'camera' ? camPosition : screenPosition;
        interactionCtx.strokeStyle = 'white';
        interactionCtx.lineWidth = 2;
        interactionCtx.strokeRect(position.x, position.y, position.width, position.height);
        drawResizeHandles(interactionCtx, position);
      }

      animationFrameRef.current = requestAnimationFrame(updateCanvas);
    };

    animationFrameRef.current = requestAnimationFrame(updateCanvas);

    const container = interactionCanvas.parentElement as HTMLElement | null;
    const resizeObserver = new ResizeObserver(() => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      requestAnimationFrame(updateCanvas);
    });

    if (container) {
      resizeObserver.observe(container);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [screenStream, mediaStream, camPosition, screenPosition, selectedElement, drawResizeHandles, getIsCamFlipped]);

  useEffect(() => {
    const canvas = ref as React.RefObject<HTMLCanvasElement>;
    const ctx = canvas.current?.getContext('2d', { alpha: false });
    const screenVideo = screenVideoRef.current;
    const mediaVideo = mediaVideoRef.current;

    if (!canvas.current || !ctx) return;

    ctx.imageSmoothingEnabled = false;

    const updateCanvas = () => {
      const container = canvas.current!.parentElement;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;

      canvas.current!.style.width = `${containerWidth}px`;
      canvas.current!.style.height = `${containerHeight}px`;

      const scale = window.devicePixelRatio;
      canvas.current!.width = Math.floor(containerWidth * scale);
      canvas.current!.height = Math.floor(containerHeight * scale);

      ctx.scale(scale, scale);

      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, containerWidth, containerHeight);

      if (screenVideo && screenStream && screenVideo.videoWidth > 0) {
        ctx.drawImage(screenVideo, screenPosition.x, screenPosition.y, screenPosition.width, screenPosition.height);
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
      }

      animationFrameRef.current = requestAnimationFrame(updateCanvas);
    };

    if (screenVideo) {
      screenVideo.onloadedmetadata = updateCanvas;
    }
    if (mediaVideo) {
      mediaVideo.onloadedmetadata = updateCanvas;
    }

    animationFrameRef.current = requestAnimationFrame(updateCanvas);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [ref, screenStream, mediaStream, screenPosition, camPosition, getIsCamFlipped]);

  return (
    <>
      <canvas ref={ref} className="absolute left-0 top-0 h-full w-full" />
      <canvas
        ref={interactionCanvasRef}
        className="absolute left-0 top-0 h-full w-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ background: 'transparent' }}
      />
      <video ref={screenVideoRef} autoPlay playsInline className="hidden" />
      <video ref={mediaVideoRef} autoPlay playsInline className="hidden" />
    </>
  );
});

StreamCanvas.displayName = 'StreamCanvas';
