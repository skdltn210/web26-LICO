import { useEffect, useState, forwardRef } from 'react';
import { useCanvasElement } from '@hooks/canvas/useCanvasElement';
import { Position, Point } from '@/types/canvas';

type SelectedElement = 'screen' | 'camera' | null;

interface InteractionCanvasProps {
  screenStream: MediaStream | null;
  mediaStream: MediaStream | null;
  screenPosition: Position;
  camPosition: Position;
  setScreenPosition: (position: Position | ((prev: Position) => Position)) => void;
  setCamPosition: (position: Position | ((prev: Position) => Position)) => void;
  isDrawingMode: boolean;
  style?: React.CSSProperties;
}

export const InteractionCanvas = forwardRef<HTMLCanvasElement, InteractionCanvasProps>((props, forwardedRef) => {
  const [selectedElement, setSelectedElement] = useState<SelectedElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const screenAspectRatio = 16 / 9;
  const cameraAspectRatio = 4 / 3;

  const getCanvasElement = (): HTMLCanvasElement | null => {
    if (!forwardedRef) return null;
    return 'current' in forwardedRef ? forwardedRef.current : null;
  };

  const isPointInInteractionArea = (x: number, y: number): boolean => {
    const canvas = getCanvasElement();
    if (!canvas) return false;

    return x >= 0 && x <= canvas.width / 2 && y >= 0 && y <= canvas.height / 2;
  };

  const isPointInElement = (x: number, y: number, position: Position): boolean => {
    return x >= position.x && x <= position.x + position.width && y >= position.y && y <= position.y + position.height;
  };

  const getCanvasPoint = (e: MouseEvent | React.MouseEvent): Point => {
    const canvas = getCanvasElement();
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    return {
      x: x * 2,
      y: y * 2,
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
    canvasWidth: getCanvasElement()?.width || 0,
    canvasHeight: getCanvasElement()?.height || 0,
  });

  const maintainAspectRatio = (newPosition: Position, isCamera: boolean): Position => {
    const aspectRatio = isCamera ? cameraAspectRatio : screenAspectRatio;
    const width = newPosition.width;
    const height = width / aspectRatio;

    return { ...newPosition, height };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (props.isDrawingMode) return;

    const point = getCanvasPoint(e);
    if (!isPointInInteractionArea(point.x, point.y)) {
      setSelectedElement(null);
      return;
    }

    if (selectedElement) {
      const currentPosition = selectedElement === 'camera' ? props.camPosition : props.screenPosition;
      const resizeStarted = handleResizeStart(point.x, point.y, currentPosition);
      if (resizeStarted) return;
    }

    if (props.mediaStream && isPointInElement(point.x, point.y, props.camPosition)) {
      setSelectedElement('camera');
      setIsDragging(true);
      setDragStart({ x: point.x - props.camPosition.x, y: point.y - props.camPosition.y });
    } else if (props.screenStream && isPointInElement(point.x, point.y, props.screenPosition)) {
      setSelectedElement('screen');
      setIsDragging(true);
      setDragStart({ x: point.x - props.screenPosition.x, y: point.y - props.screenPosition.y });
    } else {
      setSelectedElement(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (props.isDrawingMode) return;

    const point = getCanvasPoint(e);
    const canvas = getCanvasElement();
    if (!canvas) return;

    if (!isPointInInteractionArea(point.x, point.y)) {
      canvas.style.cursor = 'default';
      return;
    }

    if (selectedElement) {
      const currentPosition = selectedElement === 'camera' ? props.camPosition : props.screenPosition;
      const resizeHandle = getResizeHandle(point.x, point.y, currentPosition);
      canvas.style.cursor = resizeHandle
        ? getResizeCursor(resizeHandle)
        : isPointInElement(point.x, point.y, currentPosition)
          ? 'move'
          : 'default';
    }
  };

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const canvas = getCanvasElement();
      if (!canvas || !(e.target instanceof HTMLCanvasElement) || e.target !== canvas) {
        setSelectedElement(null);
      }
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (props.isDrawingMode || (!isDragging && !isResizing)) return;

      const canvas = getCanvasElement();
      if (!canvas) return;

      const point = getCanvasPoint(e);
      const maxWidth = canvas.width / 2;
      const maxHeight = canvas.height / 2;

      const clampedX = Math.max(0, Math.min(point.x, maxWidth));
      const clampedY = Math.max(0, Math.min(point.y, maxHeight));

      if (selectedElement) {
        if (isResizing) {
          const newPosition = handleResize(
            clampedX,
            clampedY,
            selectedElement === 'camera' ? props.camPosition : props.screenPosition,
          );
          if (newPosition) {
            const adjustedPosition = maintainAspectRatio(newPosition, selectedElement === 'camera');
            const setPosition = selectedElement === 'camera' ? props.setCamPosition : props.setScreenPosition;

            setPosition((prev: Position) => ({
              ...adjustedPosition,
              x: Math.max(0, Math.min(adjustedPosition.x, maxWidth - prev.width)),
              y: Math.max(0, Math.min(adjustedPosition.y, maxHeight - prev.height)),
              width: Math.min(adjustedPosition.width, maxWidth),
              height: Math.min(adjustedPosition.height, maxHeight),
            }));
          }
        } else if (isDragging) {
          const setPosition = selectedElement === 'camera' ? props.setCamPosition : props.setScreenPosition;
          const newX = clampedX - dragStart.x;
          const newY = clampedY - dragStart.y;

          setPosition((prev: Position) => ({
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
  }, [
    props.isDrawingMode,
    isDragging,
    isResizing,
    selectedElement,
    props.camPosition,
    props.screenPosition,
    dragStart,
  ]);

  useEffect(() => {
    const canvas = getCanvasElement();
    const ctx = canvas?.getContext('2d');

    if (!canvas || !ctx) return;

    const container = canvas.parentElement?.parentElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.clearRect(0, 0, width, height);

    if (selectedElement) {
      const currentPosition = selectedElement === 'camera' ? props.camPosition : props.screenPosition;

      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.strokeRect(currentPosition.x, currentPosition.y, currentPosition.width, currentPosition.height);
      drawResizeHandles(ctx, currentPosition);
    }
  }, [selectedElement, props.camPosition, props.screenPosition, drawResizeHandles]);

  return (
    <canvas
      ref={forwardedRef}
      className="absolute left-0 top-0 h-full w-full"
      style={{
        ...props.style,
        background: 'transparent',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={() => handleResizeEnd()}
      onMouseLeave={() => handleResizeEnd()}
    />
  );
});

InteractionCanvas.displayName = 'InteractionCanvas';
