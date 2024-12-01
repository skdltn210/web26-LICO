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

  const getScale = (): number => {
    return window.devicePixelRatio;
  };

  const getCanvasPoint = (e: MouseEvent | React.MouseEvent): Point => {
    const canvas = getCanvasElement();
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scale = getScale();

    const x = (e.clientX - rect.left) * scale;
    const y = (e.clientY - rect.top) * scale;

    return { x, y };
  };

  const isPointInInteractionArea = (x: number, y: number): boolean => {
    const canvas = getCanvasElement();
    if (!canvas) return false;

    return x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height;
  };

  const isPointInElement = (x: number, y: number, position: Position): boolean => {
    const scale = getScale();
    const scaledPosition = {
      x: position.x * scale,
      y: position.y * scale,
      width: position.width * scale,
      height: position.height * scale,
    };

    return (
      x >= scaledPosition.x &&
      x <= scaledPosition.x + scaledPosition.width &&
      y >= scaledPosition.y &&
      y <= scaledPosition.y + scaledPosition.height
    );
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
      const scale = getScale();
      const scaledPosition = {
        ...currentPosition,
        x: currentPosition.x * scale,
        y: currentPosition.y * scale,
        width: currentPosition.width * scale,
        height: currentPosition.height * scale,
      };
      const resizeStarted = handleResizeStart(point.x, point.y, scaledPosition);
      if (resizeStarted) {
        return;
      }
    }

    const isClickingCamera = props.mediaStream && isPointInElement(point.x, point.y, props.camPosition);
    const isClickingScreen = props.screenStream && isPointInElement(point.x, point.y, props.screenPosition);

    if (isClickingCamera) {
      setSelectedElement('camera');
      setIsDragging(true);
      const scale = getScale();
      setDragStart({
        x: point.x - props.camPosition.x * scale,
        y: point.y - props.camPosition.y * scale,
      });
    } else if (isClickingScreen) {
      setSelectedElement('screen');
      setIsDragging(true);
      const scale = getScale();
      setDragStart({
        x: point.x - props.screenPosition.x * scale,
        y: point.y - props.screenPosition.y * scale,
      });
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
      const scale = getScale();
      const scaledPosition = {
        x: currentPosition.x * scale,
        y: currentPosition.y * scale,
        width: currentPosition.width * scale,
        height: currentPosition.height * scale,
      };

      const resizeHandle = getResizeHandle(point.x, point.y, scaledPosition);

      if (resizeHandle) {
        canvas.style.cursor = getResizeCursor(resizeHandle);
      } else if (isPointInElement(point.x, point.y, currentPosition)) {
        canvas.style.cursor = 'move';
      } else {
        canvas.style.cursor = 'default';
      }
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

      const container = canvas.parentElement?.parentElement;
      if (!container) return;

      const point = getCanvasPoint(e);
      const scale = getScale();

      if (selectedElement) {
        if (isResizing) {
          const currentPosition = selectedElement === 'camera' ? props.camPosition : props.screenPosition;
          const scaledPosition = {
            ...currentPosition,
            x: currentPosition.x * scale,
            y: currentPosition.y * scale,
            width: currentPosition.width * scale,
            height: currentPosition.height * scale,
          };

          const newPosition = handleResize(point.x, point.y, scaledPosition);
          if (newPosition) {
            const unscaledPosition = {
              x: newPosition.x / scale,
              y: newPosition.y / scale,
              width: newPosition.width / scale,
              height: newPosition.height / scale,
            };

            const adjustedPosition = maintainAspectRatio(unscaledPosition, selectedElement === 'camera');
            const setPosition = selectedElement === 'camera' ? props.setCamPosition : props.setScreenPosition;

            setPosition((prev: Position) => ({
              ...adjustedPosition,
              x: Math.max(0, Math.min(adjustedPosition.x, container.clientWidth - prev.width)),
              y: Math.max(0, Math.min(adjustedPosition.y, container.clientHeight - prev.height)),
              width: Math.min(adjustedPosition.width, container.clientWidth),
              height: Math.min(adjustedPosition.height, container.clientHeight),
            }));
          }
        } else if (isDragging) {
          const setPosition = selectedElement === 'camera' ? props.setCamPosition : props.setScreenPosition;
          const newX = point.x / scale - dragStart.x / scale;
          const newY = point.y / scale - dragStart.y / scale;

          setPosition((prev: Position) => ({
            ...prev,
            x: Math.max(0, Math.min(container.clientWidth - prev.width, newX)),
            y: Math.max(0, Math.min(container.clientHeight - prev.height, newY)),
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

    const scale = getScale();
    const container = canvas.parentElement?.parentElement;
    if (!container) return;

    canvas.width = container.clientWidth * scale;
    canvas.height = container.clientHeight * scale;
    canvas.style.width = `${container.clientWidth}px`;
    canvas.style.height = `${container.clientHeight}px`;

    ctx.scale(scale, scale);
    ctx.clearRect(0, 0, canvas.width / scale, canvas.height / scale);

    if (selectedElement) {
      const currentPosition = selectedElement === 'camera' ? props.camPosition : props.screenPosition;

      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.strokeRect(currentPosition.x, currentPosition.y, currentPosition.width, currentPosition.height);

      drawResizeHandles(ctx, {
        x: currentPosition.x * scale,
        y: currentPosition.y * scale,
        width: currentPosition.width * scale,
        height: currentPosition.height * scale,
      });
    }
  }, [selectedElement, props.camPosition, props.screenPosition, drawResizeHandles]);

  return (
    <canvas
      ref={forwardedRef}
      className="absolute left-0 top-0 h-full w-full"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={() => handleResizeEnd()}
    />
  );
});

InteractionCanvas.displayName = 'InteractionCanvas';
