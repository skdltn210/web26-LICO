import { forwardRef, useEffect, useRef, useState } from 'react';
import { useCanvasElement } from '@/hooks/canvas/useCanvasElement';
import { Position, Point } from '@/types/canvas';

interface InteractionCanvasProps {
  screenStream: MediaStream | null;
  mediaStream: MediaStream | null;
  screenPosition: Position;
  camPosition: Position;
  onScreenPositionChange: (position: Position | ((prev: Position) => Position)) => void;
  onCamPositionChange: (position: Position | ((prev: Position) => Position)) => void;
}

type SelectedElement = 'screen' | 'camera' | null;

export const InteractionCanvas = forwardRef<HTMLCanvasElement, InteractionCanvasProps>(
  ({ screenStream, mediaStream, screenPosition, camPosition, onScreenPositionChange, onCamPositionChange }, ref) => {
    const [selectedElement, setSelectedElement] = useState<SelectedElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [screenAspectRatio, setScreenAspectRatio] = useState(16 / 9);
    const [cameraAspectRatio, setCameraAspectRatio] = useState(4 / 3);
    const animationFrameRef = useRef<number>();

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
      return (
        x >= position.x && x <= position.x + position.width && y >= position.y && y <= position.y + position.height
      );
    };

    const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
      const canvas = ref as React.RefObject<HTMLCanvasElement>;
      if (!canvas.current) return { x: 0, y: 0 };

      const rect = canvas.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      return { x, y };
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
      canvasWidth: (ref as React.RefObject<HTMLCanvasElement>).current?.width || 0,
      canvasHeight: (ref as React.RefObject<HTMLCanvasElement>).current?.height || 0,
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
        setDragStart({ x: point.x - screenPosition.x, y: point.y - screenPosition.y });
      }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = ref as React.RefObject<HTMLCanvasElement>;
      if (!canvas.current) return;

      const point = getCanvasPoint(e);

      if (!selectedElement) {
        canvas.current.style.cursor = 'default';
        return;
      }

      const currentPosition = selectedElement === 'camera' ? camPosition : screenPosition;
      const resizeHandle = getResizeHandle(point.x, point.y, currentPosition);

      canvas.current.style.cursor = resizeHandle
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
      if (mediaStream) {
        const video = document.createElement('video');
        video.srcObject = mediaStream;
        video.onloadedmetadata = () => {
          setCameraAspectRatio(video.videoWidth / video.videoHeight);
          const width = 240;
          const height = width / (video.videoWidth / video.videoHeight);
          const newPosition: Position = {
            ...camPosition,
            width,
            height,
          };
          onCamPositionChange(newPosition);
        };
      }
    }, [mediaStream, camPosition]);

    useEffect(() => {
      if (screenStream) {
        const video = document.createElement('video');
        video.srcObject = screenStream;
        video.onloadedmetadata = () => {
          setScreenAspectRatio(video.videoWidth / video.videoHeight);
          const canvas = ref as React.RefObject<HTMLCanvasElement>;
          if (canvas.current) {
            const containerWidth = canvas.current.clientWidth;
            const containerHeight = canvas.current.clientHeight;
            const videoAspectRatio = video.videoWidth / video.videoHeight;

            let width = containerWidth;
            let height = containerWidth / videoAspectRatio;

            if (height > containerHeight) {
              height = containerHeight;
              width = height * videoAspectRatio;
            }

            onScreenPositionChange({
              x: (containerWidth - width) / 2,
              y: (containerHeight - height) / 2,
              width,
              height,
            });
          }
        };
      }
    }, [screenStream]);

    useEffect(() => {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (!isDragging && !isResizing) return;

        const canvas = ref as React.RefObject<HTMLCanvasElement>;
        if (!canvas.current) return;

        const rect = canvas.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const maxWidth = canvas.current.width / 2;
        const maxHeight = canvas.current.height / 2;

        if (selectedElement) {
          const currentPosition = selectedElement === 'camera' ? camPosition : screenPosition;
          const setPosition = selectedElement === 'camera' ? onCamPositionChange : onScreenPositionChange;

          if (isResizing) {
            const newPosition = handleResize(x, y, currentPosition);
            if (newPosition) {
              const adjustedPosition = maintainAspectRatio(newPosition, selectedElement === 'camera');
              setPosition({
                ...adjustedPosition,
                x: Math.max(0, Math.min(adjustedPosition.x, maxWidth - adjustedPosition.width)),
                y: Math.max(0, Math.min(adjustedPosition.y, maxHeight - adjustedPosition.height)),
                width: Math.min(adjustedPosition.width, maxWidth),
                height: Math.min(adjustedPosition.height, maxHeight),
              });
            }
          } else if (isDragging) {
            const newX = x - dragStart.x;
            const newY = y - dragStart.y;

            const newPosition: Position = {
              ...currentPosition,
              x: Math.max(0, Math.min(maxWidth - currentPosition.width, newX)),
              y: Math.max(0, Math.min(maxHeight - currentPosition.height, newY)),
            };
            setPosition(newPosition);
          }
        }
      };

      const handleGlobalMouseUp = () => {
        setIsDragging(false);
        handleResizeEnd();
      };

      const handleGlobalClick = (e: MouseEvent) => {
        const canvas = ref as React.RefObject<HTMLCanvasElement>;
        if (!canvas.current) return;

        const rect = canvas.current.getBoundingClientRect();
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

      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('mousedown', handleGlobalClick);

      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
        window.removeEventListener('mousedown', handleGlobalClick);
      };
    }, [
      isDragging,
      isResizing,
      selectedElement,
      handleResize,
      handleResizeEnd,
      dragStart,
      screenPosition,
      camPosition,
      mediaStream,
      screenStream,
    ]);

    useEffect(() => {
      const canvas = ref as React.RefObject<HTMLCanvasElement>;
      const ctx = canvas.current?.getContext('2d', { alpha: true });

      if (!canvas.current || !ctx) return;

      const updateCanvas = () => {
        if (!canvas.current) return;

        const scale = window.devicePixelRatio;
        canvas.current.width = Math.floor(canvas.current.clientWidth * scale);
        canvas.current.height = Math.floor(canvas.current.clientHeight * scale);
        canvas.current.style.width = `${canvas.current.clientWidth}px`;
        canvas.current.style.height = `${canvas.current.clientHeight}px`;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(scale, scale);
        ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);

        if (selectedElement) {
          const position = selectedElement === 'camera' ? camPosition : screenPosition;
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.strokeRect(position.x, position.y, position.width, position.height);
          drawResizeHandles(ctx, position);
        }

        animationFrameRef.current = requestAnimationFrame(updateCanvas);
      };

      animationFrameRef.current = requestAnimationFrame(updateCanvas);

      const resizeObserver = new ResizeObserver(() => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        requestAnimationFrame(updateCanvas);
      });

      if (canvas.current) {
        resizeObserver.observe(canvas.current);
      }

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        resizeObserver.disconnect();
      };
    }, [ref, screenPosition, camPosition, selectedElement, drawResizeHandles]);
    return (
      <canvas
        ref={ref}
        className="absolute left-0 top-0 h-full w-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ background: 'transparent' }}
      />
    );
  },
);

InteractionCanvas.displayName = 'InteractionCanvas';
