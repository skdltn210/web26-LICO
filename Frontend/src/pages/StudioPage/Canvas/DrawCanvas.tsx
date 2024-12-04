import { useEffect, forwardRef } from 'react';
import { useDrawing } from '@hooks/canvas/useDrawing';
import { Point, CanvasProps } from '@/types/canvas';
import pencilCursor from '@assets/icons/pencilCursor.svg?url';
import eraserCursor from '@assets/icons/eraserCursor.svg?url';

export const DrawCanvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  ({ drawingState, isDrawingMode, className }, ref) => {
    const { paths, startDrawing, continueDrawing, endDrawing } = useDrawing();

    const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
      const canvas = ref as React.RefObject<HTMLCanvasElement>;
      if (!canvas.current) return { x: 0, y: 0 };

      const rect = canvas.current.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    useEffect(() => {
      const canvas = ref as React.RefObject<HTMLCanvasElement>;
      const ctx = canvas.current?.getContext('2d', { alpha: true });

      if (!canvas.current || !ctx) return;

      const updateCanvas = () => {
        const container = canvas.current?.parentElement?.parentElement;
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

        paths.forEach(path => {
          if (path.points.length < 2) return;

          ctx.beginPath();
          ctx.moveTo(path.points[0].x, path.points[0].y);

          for (let i = 1; i < path.points.length; i++) {
            ctx.lineTo(path.points[i].x, path.points[i].y);
          }

          if (path.type === 'erase') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.strokeStyle = 'rgba(0,0,0,1)';
          } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = path.color;
          }

          ctx.lineWidth = path.width;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();
        });

        ctx.globalCompositeOperation = 'source-over';
      };

      updateCanvas();

      const resizeObserver = new ResizeObserver(() => {
        updateCanvas();
      });

      if (canvas.current.parentElement?.parentElement) {
        resizeObserver.observe(canvas.current.parentElement.parentElement);
      }

      return () => {
        resizeObserver.disconnect();
      };
    }, [ref, paths]);

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (drawingState.isDrawing || drawingState.isErasing) {
        const point = getCanvasPoint(e);
        startDrawing(
          point,
          drawingState.isDrawing ? drawingState.drawTool.color : '#ffffff',
          drawingState.isDrawing ? drawingState.drawTool.width : drawingState.eraseTool.width,
          drawingState.isErasing ? 'erase' : 'draw',
        );
      }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = ref as React.RefObject<HTMLCanvasElement>;
      if (!canvas.current) return;

      const point = getCanvasPoint(e);

      if (drawingState.isTexting) {
        canvas.current.style.cursor = 'text';
        return;
      }

      if (drawingState.isDrawing) {
        canvas.current.style.cursor = `url(${pencilCursor}) 0 24, crosshair`;
        continueDrawing(point);
        return;
      }

      if (drawingState.isErasing) {
        canvas.current.style.cursor = `url(${eraserCursor}) 8 24, cell`;
        continueDrawing(point);
        return;
      }

      canvas.current.style.cursor = 'default';
    };

    const getCursor = () => {
      if (drawingState.isDrawing) return `url(${pencilCursor}) 0 24, crosshair`;
      if (drawingState.isErasing) return `url(${eraserCursor}) 8 24, cell`;
      return 'default';
    };

    return (
      <canvas
        ref={ref}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        className={`absolute left-0 top-0 h-full w-full ${className}`}
        style={{
          cursor: getCursor(),
          pointerEvents: isDrawingMode ? 'auto' : 'none',
        }}
      />
    );
  },
);
