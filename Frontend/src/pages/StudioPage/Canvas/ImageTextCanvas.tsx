import { useEffect, forwardRef } from 'react';
import { useText } from '@hooks/canvas/useText';
import { useImage } from '@hooks/canvas/useImage';
import { Point, CanvasProps } from '@/types/canvas';

export const ImageTextCanvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  ({ drawingState, isTextingMode, className }, ref) => {
    const { textInput, startTextInput, updateText, completeText, cancelText, drawTexts } = useText({
      color: drawingState.textTool.color,
      fontSize: drawingState.textTool.width,
    });
    const { drawImages } = useImage();

    useEffect(() => {
      if (!isTextingMode && textInput.isVisible) {
        const canvas = ref as React.RefObject<HTMLCanvasElement>;
        const ctx = canvas.current?.getContext('2d') || null;

        if (textInput.text) {
          completeText(ctx);
        } else {
          cancelText();
        }
      }
    }, [isTextingMode]);

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
        drawImages(ctx);
        drawTexts(ctx);
      };

      updateCanvas();

      const resizeObserver = new ResizeObserver(updateCanvas);
      if (canvas.current.parentElement?.parentElement) {
        resizeObserver.observe(canvas.current.parentElement.parentElement);
      }

      return () => resizeObserver.disconnect();
    }, [ref, drawTexts, drawImages]);

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const point = getCanvasPoint(e);

      if (textInput.isVisible) {
        cancelText();
        return;
      }

      if (drawingState.isTexting) {
        startTextInput(point);
      }
    };

    return (
      <>
        <canvas
          ref={ref}
          onMouseDown={handleMouseDown}
          className={`absolute left-0 top-0 h-full w-full ${className}`}
          style={{
            cursor: drawingState.isTexting ? 'text' : 'default',
            pointerEvents: isTextingMode ? 'auto' : 'none',
          }}
        />
        {textInput.isVisible && isTextingMode && (
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
  },
);
