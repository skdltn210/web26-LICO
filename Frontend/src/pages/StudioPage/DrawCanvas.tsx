import { forwardRef, useEffect } from 'react';
import { useDrawing } from '@hooks/canvas/useDrawing';
import { useText } from '@hooks/canvas/useText';
import { useImage } from '@hooks/canvas/useImage';
import { Point } from '@/types/canvas';
import pencilCursor from '@assets/icons/pencilCursor.svg?url';
import eraserCursor from '@assets/icons/eraserCursor.svg?url';

interface DrawCanvasProps {
  drawingState: {
    isDrawing: boolean;
    isErasing: boolean;
    isTexting: boolean;
    drawTool: { color: string; width: number };
    eraseTool: { width: number };
    textTool: { color: string; width: number };
  };
}

export const DrawCanvas = forwardRef<HTMLCanvasElement, DrawCanvasProps>(({ drawingState }, ref) => {
  const { paths, startDrawing, continueDrawing, endDrawing } = useDrawing();
  const { textInput, startTextInput, updateText, completeText, cancelText, drawTexts } = useText({
    color: drawingState.textTool.color,
    fontSize: drawingState.textTool.width,
  });
  const { drawImages } = useImage();

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
      const container = canvas.current!.parentElement;
      if (container) {
        const scale = window.devicePixelRatio;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        canvas.current!.width = containerWidth * scale;
        canvas.current!.height = containerHeight * scale;
        canvas.current!.style.width = `${containerWidth}px`;
        canvas.current!.style.height = `${containerHeight}px`;

        ctx.scale(scale, scale);
      }

      ctx.clearRect(
        0,
        0,
        canvas.current!.width / window.devicePixelRatio,
        canvas.current!.height / window.devicePixelRatio,
      );

      drawImages(ctx);

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
      drawTexts(ctx);
    };

    updateCanvas();

    const resizeObserver = new ResizeObserver(() => {
      updateCanvas();
    });

    if (canvas.current.parentElement) {
      resizeObserver.observe(canvas.current.parentElement);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref, paths, drawTexts, drawImages]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && textInput.isVisible) {
        cancelText();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [textInput.isVisible, cancelText]);

  useEffect(() => {
    let isMouseDown = false;
    let mouseDownTarget: EventTarget | null = null;

    const handleMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      mouseDownTarget = e.target;
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isMouseDown || !textInput.isVisible) {
        isMouseDown = false;
        mouseDownTarget = null;
        return;
      }

      const canvas = (ref as React.RefObject<HTMLCanvasElement>).current;
      const textInputElement = document.getElementById('text-input');

      if (e.target === mouseDownTarget) {
        const isClickInsideCanvas = canvas?.contains(e.target as Node);
        const isClickInsideTextInput = textInputElement?.contains(e.target as Node);

        if (!isClickInsideCanvas && !isClickInsideTextInput) {
          if (!textInput.text) {
            cancelText();
          } else {
            const ctx = canvas?.getContext('2d') || null;
            completeText(ctx);
          }
        }
      }

      isMouseDown = false;
      mouseDownTarget = null;
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [ref, textInput.isVisible, textInput.text, cancelText, completeText]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);

    if (textInput.isVisible) {
      cancelText();
      return;
    }

    if (drawingState.isTexting) {
      startTextInput(point);
      return;
    }

    if (drawingState.isDrawing || drawingState.isErasing) {
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

  return (
    <>
      <canvas
        ref={ref}
        className="absolute left-0 top-0 h-full w-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        style={{ background: 'transparent' }}
      />
      {textInput.isVisible && (
        <div
          className="absolute"
          style={{
            left: textInput.position.x,
            top: textInput.position.y - drawingState.textTool.width * 0.5,
            zIndex: 100,
          }}
        >
          <input
            id="text-input"
            type="text"
            value={textInput.text}
            onChange={e => updateText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                const canvas = ref as React.RefObject<HTMLCanvasElement>;
                const ctx = canvas.current?.getContext('2d') || null;
                completeText(ctx);
              }
            }}
            className="m-0 min-w-[100px] border-none bg-transparent p-0 outline-none"
            style={{
              color: drawingState.textTool.color,
              fontSize: `${drawingState.textTool.width}px`,
              lineHeight: '1',
            }}
            autoFocus
            placeholder="텍스트 입력"
          />
        </div>
      )}
    </>
  );
});

DrawCanvas.displayName = 'DrawCanvas';
