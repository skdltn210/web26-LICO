import { useState, useCallback } from 'react';
import { Position, UseCanvasElementProps } from '@/types/canvas';

type ResizeCorner = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
type ResizeHandle = ResizeCorner | null;

export const useCanvasElement = ({ minSize = 100, canvasWidth, canvasHeight }: UseCanvasElementProps) => {
  const [isResizing, setIsResizing] = useState<ResizeHandle>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [originalPosition, setOriginalPosition] = useState<Position | null>(null);

  const drawResizeHandles = useCallback((ctx: CanvasRenderingContext2D, position: Position) => {
    const scale = window.devicePixelRatio;
    const handleSize = 7;
    const halfHandle = handleSize / 2;

    const scaledPosition = {
      x: position.x / scale,
      y: position.y / scale,
      width: position.width / scale,
      height: position.height / scale,
    };

    const handles = [
      { x: scaledPosition.x - halfHandle, y: scaledPosition.y - halfHandle },
      { x: scaledPosition.x + scaledPosition.width - halfHandle, y: scaledPosition.y - halfHandle },
      { x: scaledPosition.x - halfHandle, y: scaledPosition.y + scaledPosition.height - halfHandle },
      {
        x: scaledPosition.x + scaledPosition.width - halfHandle,
        y: scaledPosition.y + scaledPosition.height - halfHandle,
      },
    ];

    ctx.fillStyle = 'white';
    handles.forEach(handle => {
      ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
      ctx.strokeStyle = 'red';
      ctx.strokeRect(handle.x, handle.y, handleSize, handleSize);
    });
  }, []);

  const getResizeHandle = useCallback(
    (x: number, y: number, position: Position): ResizeHandle => {
      if (isResizing) return isResizing;

      const scale = window.devicePixelRatio;
      const handleSize = 7;
      const hitArea = handleSize * 2;

      const unscaledPosition = {
        x: position.x / scale,
        y: position.y / scale,
        width: position.width / scale,
        height: position.height / scale,
      };

      const unscaledX = x / scale;
      const unscaledY = y / scale;

      const handlePoints: Record<ResizeCorner, { x: number; y: number }> = {
        topLeft: {
          x: unscaledPosition.x,
          y: unscaledPosition.y,
        },
        topRight: {
          x: unscaledPosition.x + unscaledPosition.width,
          y: unscaledPosition.y,
        },
        bottomLeft: {
          x: unscaledPosition.x,
          y: unscaledPosition.y + unscaledPosition.height,
        },
        bottomRight: {
          x: unscaledPosition.x + unscaledPosition.width,
          y: unscaledPosition.y + unscaledPosition.height,
        },
      };

      for (const [handle, point] of Object.entries(handlePoints)) {
        const dx = Math.abs(unscaledX - point.x);
        const dy = Math.abs(unscaledY - point.y);

        if (Math.sqrt(dx * dx + dy * dy) <= hitArea) {
          return handle as ResizeCorner;
        }
      }

      return null;
    },
    [isResizing],
  );

  const getResizeCursor = useCallback((handle: ResizeHandle): string => {
    if (!handle) return 'default';

    const cursors: Record<ResizeCorner, string> = {
      topLeft: 'nw-resize',
      topRight: 'ne-resize',
      bottomLeft: 'sw-resize',
      bottomRight: 'se-resize',
    };

    return cursors[handle];
  }, []);

  const handleResizeStart = useCallback(
    (x: number, y: number, position: Position) => {
      const resizeHandle = getResizeHandle(x, y, position);
      if (resizeHandle) {
        setIsResizing(resizeHandle);
        setOriginalPosition(position);
        setDragStart({ x, y });
        return true;
      }
      return false;
    },
    [getResizeHandle],
  );

  const handleResize = useCallback(
    (x: number, y: number, _position: Position): Position | null => {
      if (!isResizing || !originalPosition) return null;

      const dx = x - dragStart.x;
      const dy = y - dragStart.y;
      let newPosition = { ...originalPosition };
      const scale = window.devicePixelRatio;

      const applyResizeWithConstraints = (proposed: Position): Position => {
        const maxWidth = canvasWidth;
        const maxHeight = canvasHeight;

        return {
          x: Math.max(0, Math.min(proposed.x, maxWidth - proposed.width)),
          y: Math.max(0, Math.min(proposed.y, maxHeight - proposed.height)),
          width: Math.max(minSize * scale, Math.min(proposed.width, maxWidth - proposed.x)),
          height: Math.max(minSize * scale, Math.min(proposed.height, maxHeight - proposed.y)),
        };
      };

      switch (isResizing) {
        case 'topLeft': {
          const width = Math.max(minSize * scale, originalPosition.width - dx);
          const height = Math.max(minSize * scale, originalPosition.height - dy);
          const x = originalPosition.x + (originalPosition.width - width);
          const y = originalPosition.y + (originalPosition.height - height);
          newPosition = applyResizeWithConstraints({ x, y, width, height });
          break;
        }
        case 'topRight': {
          const width = Math.max(minSize * scale, originalPosition.width + dx);
          const height = Math.max(minSize * scale, originalPosition.height - dy);
          const y = originalPosition.y + (originalPosition.height - height);
          newPosition = applyResizeWithConstraints({
            x: originalPosition.x,
            y,
            width,
            height,
          });
          break;
        }
        case 'bottomLeft': {
          const width = Math.max(minSize * scale, originalPosition.width - dx);
          const height = Math.max(minSize * scale, originalPosition.height + dy);
          const x = originalPosition.x + (originalPosition.width - width);
          newPosition = applyResizeWithConstraints({
            x,
            y: originalPosition.y,
            width,
            height,
          });
          break;
        }
        case 'bottomRight': {
          const width = Math.max(minSize * scale, originalPosition.width + dx);
          const height = Math.max(minSize * scale, originalPosition.height + dy);
          newPosition = applyResizeWithConstraints({
            x: originalPosition.x,
            y: originalPosition.y,
            width,
            height,
          });
          break;
        }
      }

      return newPosition;
    },
    [isResizing, originalPosition, dragStart.x, dragStart.y, canvasWidth, canvasHeight, minSize],
  );

  const handleResizeEnd = useCallback(() => {
    setIsResizing(null);
    setOriginalPosition(null);
  }, []);

  return {
    isResizing,
    drawResizeHandles,
    getResizeHandle,
    getResizeCursor,
    handleResizeStart,
    handleResize,
    handleResizeEnd,
  };
};
