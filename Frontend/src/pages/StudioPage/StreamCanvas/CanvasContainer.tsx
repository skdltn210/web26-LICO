import { useState, useRef } from 'react';

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface CanvasContainerProps {
  children: React.ReactNode;
  initialSize?: Size;
  initialPosition?: Position;
  minSize?: Size;
  maxSize?: Size;
  className?: string;
  style?: React.CSSProperties;
}

type ResizeDirection = 'nw' | 'ne' | 'sw' | 'se';

export default function CanvasContainer({
  children,
  initialSize = { width: 25, height: 25 },
  initialPosition = { x: 20, y: 20 },
  minSize = { width: 10, height: 10 },
  maxSize = { width: 50, height: 50 },
  className = '',
  style = {},
}: CanvasContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position>(initialPosition);
  const [size, setSize] = useState<Size>(initialSize);
  const [isSelected, setIsSelected] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection | null>(null);
  const [dragStartPos, setDragStartPos] = useState<Position>({ x: 0, y: 0 });
  const [dragStartOffset, setDragStartOffset] = useState<Position>({ x: 0, y: 0 });
  const [resizeStartSize, setResizeStartSize] = useState<Size>({ width: 0, height: 0 });
  const [resizeStartPosition, setResizeStartPosition] = useState<Position>({ x: 0, y: 0 });

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsSelected(false);
    }
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSelected(true);
  };

  const handleDragStart = (e: React.MouseEvent) => {
    const isResizeHandle = (e.target as HTMLElement).closest('[data-resize-handle="true"]');
    if (isResizeHandle) return;

    if (e.target === containerRef.current || (e.target as HTMLElement).closest('[data-drag-handle="true"]')) {
      setIsDragging(true);
      setDragStartPos({ x: e.clientX, y: e.clientY });
      setDragStartOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleResizeStart = (e: React.MouseEvent, direction: ResizeDirection) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setResizeStartSize(size);
    setResizeStartPosition(position);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const parentRect = (e.currentTarget as HTMLElement).getBoundingClientRect();

    if (isDragging) {
      const newX = Math.min(
        Math.max(0, e.clientX - dragStartOffset.x),
        parentRect.width - (containerRef.current?.offsetWidth || 0),
      );
      const newY = Math.min(
        Math.max(0, e.clientY - dragStartOffset.y),
        parentRect.height - (containerRef.current?.offsetHeight || 0),
      );

      setPosition({ x: newX, y: newY });
    } else if (isResizing && resizeDirection) {
      const deltaX = e.clientX - dragStartPos.x;
      const deltaY = e.clientY - dragStartPos.y;

      let newWidth = resizeStartSize.width;
      let newHeight = resizeStartSize.height;
      let newX = resizeStartPosition.x;
      let newY = resizeStartPosition.y;

      switch (resizeDirection) {
        case 'se':
          newWidth = resizeStartSize.width + (deltaX / parentRect.width) * 100;
          newHeight = resizeStartSize.height + (deltaY / parentRect.height) * 100;
          break;
        case 'sw':
          newWidth = resizeStartSize.width - (deltaX / parentRect.width) * 100;
          newHeight = resizeStartSize.height + (deltaY / parentRect.height) * 100;
          newX = resizeStartPosition.x + deltaX;
          break;
        case 'ne':
          newWidth = resizeStartSize.width + (deltaX / parentRect.width) * 100;
          newHeight = resizeStartSize.height - (deltaY / parentRect.height) * 100;
          newY = resizeStartPosition.y + deltaY;
          break;
        case 'nw':
          newWidth = resizeStartSize.width - (deltaX / parentRect.width) * 100;
          newHeight = resizeStartSize.height - (deltaY / parentRect.height) * 100;
          newX = resizeStartPosition.x + deltaX;
          newY = resizeStartPosition.y + deltaY;
          break;
      }

      const clampedWidth = Math.min(Math.max(minSize.width, newWidth), maxSize.width);
      const clampedHeight = Math.min(Math.max(minSize.height, newHeight), maxSize.height);

      if (resizeDirection === 'nw' || resizeDirection === 'sw') {
        const widthDiff = clampedWidth - newWidth;
        newX -= (widthDiff / 100) * parentRect.width;
      }
      if (resizeDirection === 'nw' || resizeDirection === 'ne') {
        const heightDiff = clampedHeight - newHeight;
        newY -= (heightDiff / 100) * parentRect.height;
      }

      newX = Math.max(0, Math.min(newX, parentRect.width - (containerRef.current?.offsetWidth || 0)));
      newY = Math.max(0, Math.min(newY, parentRect.height - (containerRef.current?.offsetHeight || 0)));

      setSize({ width: clampedWidth, height: clampedHeight });
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection(null);
  };

  const resizeHandleClass = 'absolute flex h-4 w-4 items-center justify-center';
  const resizeHandleDotClass = 'h-1.5 w-1.5 rounded-sm border border-white bg-white/75';

  return (
    <div
      className="absolute h-full w-full"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleBackgroundClick}
    >
      <div
        ref={containerRef}
        className={`absolute ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} ${className}`}
        style={{
          ...style,
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${size.width}%`,
          height: `${size.height}%`,
          touchAction: 'none',
          userSelect: 'none',
        }}
        onMouseDown={handleDragStart}
        onClick={handleContainerClick}
        data-drag-handle="true"
      >
        {children}

        {isSelected && (
          <>
            <div
              className={`${resizeHandleClass} -left-2 -top-2 cursor-nw-resize`}
              onMouseDown={e => handleResizeStart(e, 'nw')}
              data-resize-handle="true"
            >
              <div className={resizeHandleDotClass} />
            </div>

            <div
              className={`${resizeHandleClass} -right-2 -top-2 cursor-ne-resize`}
              onMouseDown={e => handleResizeStart(e, 'ne')}
              data-resize-handle="true"
            >
              <div className={resizeHandleDotClass} />
            </div>

            <div
              className={`${resizeHandleClass} -bottom-2 -left-2 cursor-sw-resize`}
              onMouseDown={e => handleResizeStart(e, 'sw')}
              data-resize-handle="true"
            >
              <div className={resizeHandleDotClass} />
            </div>

            <div
              className={`${resizeHandleClass} -bottom-2 -right-2 cursor-se-resize`}
              onMouseDown={e => handleResizeStart(e, 'se')}
              data-resize-handle="true"
            >
              <div className={resizeHandleDotClass} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
