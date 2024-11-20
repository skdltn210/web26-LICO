import { useState, useCallback } from 'react';

interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
}

type ResizeCorner = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
type ResizeHandle = ResizeCorner | null;

interface UseCanvasElementProps {
  minSize?: number;
  canvasWidth: number;
  canvasHeight: number;
}

export const useCanvasElement = ({ minSize = 100, canvasWidth, canvasHeight }: UseCanvasElementProps) => {
  const [isResizing, setIsResizing] = useState<ResizeHandle>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [originalPosition, setOriginalPosition] = useState<Position | null>(null);

  const drawResizeHandles = useCallback((ctx: CanvasRenderingContext2D, position: Position) => {
    const handleSize = 8;
    const halfHandle = handleSize / 2;
    const handles = [
      { x: position.x - halfHandle, y: position.y - halfHandle },
      { x: position.x + position.width - halfHandle, y: position.y - halfHandle },
      { x: position.x - halfHandle, y: position.y + position.height - halfHandle },
      { x: position.x + position.width - halfHandle, y: position.y + position.height - halfHandle },
    ];

    ctx.fillStyle = 'white';
    handles.forEach(handle => {
      ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
      ctx.strokeStyle = '#666';
      ctx.strokeRect(handle.x, handle.y, handleSize, handleSize);
    });
  }, []);

  const getResizeHandle = useCallback(
    (x: number, y: number, position: Position): ResizeHandle => {
      if (isResizing) return isResizing;

      const handleSize = 8;
      const halfHandle = handleSize / 2;
      const handles: Record<ResizeCorner, { x: number; y: number }> = {
        topLeft: {
          x: position.x - halfHandle,
          y: position.y - halfHandle,
        },
        topRight: {
          x: position.x + position.width - halfHandle,
          y: position.y - halfHandle,
        },
        bottomLeft: {
          x: position.x - halfHandle,
          y: position.y + position.height - halfHandle,
        },
        bottomRight: {
          x: position.x + position.width - halfHandle,
          y: position.y + position.height - halfHandle,
        },
      };

      for (const [handle, point] of Object.entries(handles)) {
        if (
          x >= point.x - handleSize &&
          x <= point.x + handleSize * 2 &&
          y >= point.y - handleSize &&
          y <= point.y + handleSize * 2
        ) {
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
    (x: number, y: number, position: Position): Position | null => {
      if (!isResizing || !originalPosition) return null;

      const dx = x - dragStart.x;
      const dy = y - dragStart.y;
      let newPosition = { ...originalPosition };

      const applyResizeWithConstraints = (proposed: Position): Position => {
        return {
          x: Math.max(0, Math.min(proposed.x, canvasWidth - proposed.width)),
          y: Math.max(0, Math.min(proposed.y, canvasHeight - proposed.height)),
          width: Math.max(minSize, Math.min(proposed.width, canvasWidth - proposed.x)),
          height: Math.max(minSize, Math.min(proposed.height, canvasHeight - proposed.y)),
        };
      };

      switch (isResizing) {
        case 'topLeft': {
          const width = Math.max(minSize, originalPosition.width - dx);
          const height = Math.max(minSize, originalPosition.height - dy);
          const x = originalPosition.x + (originalPosition.width - width);
          const y = originalPosition.y + (originalPosition.height - height);
          newPosition = applyResizeWithConstraints({ x, y, width, height });
          break;
        }
        case 'topRight': {
          const width = Math.max(minSize, originalPosition.width + dx);
          const height = Math.max(minSize, originalPosition.height - dy);
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
          const width = Math.max(minSize, originalPosition.width - dx);
          const height = Math.max(minSize, originalPosition.height + dy);
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
          const width = Math.max(minSize, originalPosition.width + dx);
          const height = Math.max(minSize, originalPosition.height + dy);
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
