import { useEffect, forwardRef, useCallback, useRef } from 'react';
import { useDrawing } from '@hooks/canvas/useDrawing';
import { Point, CanvasProps } from '@/types/canvas';
import pencilCursor from '@assets/icons/pencilCursor.svg?url';
import eraserCursor from '@assets/icons/eraserCursor.svg?url';

export const DrawCanvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  ({ drawingState, isDrawingMode, className }, ref) => {
    const animationFrameRef = useRef<number>();

    const getCanvasPoint = useCallback(
      (e: React.MouseEvent<HTMLCanvasElement>): Point => {
        const canvas = ref as React.RefObject<HTMLCanvasElement>;
        if (!canvas.current) return { x: 0, y: 0 };

        const rect = canvas.current.getBoundingClientRect();
        return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
      },
      [ref],
    );

    const { paths, startDrawing, continueDrawing, endDrawing } = useDrawing();

    const updateCanvas = useCallback(() => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        const canvas = ref as React.RefObject<HTMLCanvasElement>;
        const ctx = canvas.current?.getContext('2d', { alpha: true });
        if (!canvas.current || !ctx) return;

        const container = canvas.current.parentElement?.parentElement;
        if (!container) return;

        const scale = window.devicePixelRatio;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        canvas.current.width = containerWidth * scale;
        canvas.current.height = containerHeight * scale;
        canvas.current.style.width = `${containerWidth}px`;
        canvas.current.style.height = `${containerHeight}px`;

        ctx.scale(scale, scale);
        ctx.clearRect(0, 0, containerWidth, containerHeight);

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        paths.forEach(path => {
          if (path.points.length < 2) return;

          const isErasing = path.type === 'erase';
          ctx.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over';
          ctx.strokeStyle = isErasing ? 'rgba(0,0,0,1)' : path.color;
          ctx.lineWidth = path.width;

          ctx.beginPath();
          ctx.moveTo(path.points[0].x, path.points[0].y);

          for (let i = 1; i < path.points.length; i += 2) {
            const nextPoint = path.points[i + 1] || path.points[i];
            const midPoint = {
              x: (path.points[i].x + nextPoint.x) / 2,
              y: (path.points[i].y + nextPoint.y) / 2,
            };
            ctx.quadraticCurveTo(path.points[i].x, path.points[i].y, midPoint.x, midPoint.y);
          }

          ctx.stroke();
        });

        ctx.globalCompositeOperation = 'source-over';
      });
    }, [ref, paths]);

    useEffect(() => {
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, []);

    useEffect(() => {
      const canvas = ref as React.RefObject<HTMLCanvasElement>;
      if (!canvas.current) return;

      updateCanvas();

      const resizeObserver = new ResizeObserver(updateCanvas);
      const container = canvas.current.parentElement?.parentElement;

      if (container) {
        resizeObserver.observe(container);
      }

      return () => resizeObserver.disconnect();
    }, [ref, updateCanvas]);

    const handleMouseDown = useCallback(
      (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!drawingState.isDrawing && !drawingState.isErasing) return;

        const point = getCanvasPoint(e);
        startDrawing(
          point,
          drawingState.isDrawing ? drawingState.drawTool.color : '#ffffff',
          drawingState.isDrawing ? drawingState.drawTool.width : drawingState.eraseTool.width,
          drawingState.isErasing ? 'erase' : 'draw',
        );
      },
      [drawingState, getCanvasPoint, startDrawing],
    );

    const handleMouseMove = useCallback(
      (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = ref as React.RefObject<HTMLCanvasElement>;
        if (!canvas.current) return;

        const point = getCanvasPoint(e);
        continueDrawing(point);
      },
      [ref, getCanvasPoint, continueDrawing],
    );

    const cursor = drawingState.isTexting
      ? 'text'
      : drawingState.isDrawing
        ? `url(${pencilCursor}) 0 24, crosshair`
        : drawingState.isErasing
          ? `url(${eraserCursor}) 8 24, cell`
          : 'default';

    return (
      <canvas
        ref={ref}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        className={`absolute left-0 top-0 h-full w-full ${className}`}
        style={{
          cursor,
          pointerEvents: isDrawingMode ? 'auto' : 'none',
        }}
      />
    );
  },
);
