import { useEffect, useCallback, forwardRef, CSSProperties, useRef } from 'react';
import { useText } from '@hooks/canvas/useText';
import { useImage } from '@hooks/canvas/useImage';
import { Point, CanvasProps } from '@/types/canvas';

export const ImageTextCanvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  ({ drawingState, isTextingMode, className }, ref) => {
    const animationFrameRef = useRef<number>();

    const { textInput, startTextInput, updateText, completeText, cancelText, drawTexts } = useText({
      color: drawingState.textTool.color,
      fontSize: drawingState.textTool.width,
    });

    const { drawImages } = useImage();

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

    const handleMouseDown = useCallback(
      (e: React.MouseEvent<HTMLCanvasElement>) => {
        const point = getCanvasPoint(e);

        if (textInput.isVisible) {
          cancelText();
          return;
        }

        if (drawingState.isTexting) {
          startTextInput(point);
        }
      },
      [getCanvasPoint, textInput.isVisible, cancelText, drawingState.isTexting, startTextInput],
    );

    const handleTextChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        updateText(e.target.value);
      },
      [updateText],
    );

    const handleInputKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
          const canvas = ref as React.RefObject<HTMLCanvasElement>;
          const ctx = canvas.current?.getContext('2d') || null;
          completeText(ctx);
        }
      },
      [ref, completeText],
    );

    const updateCanvas = useCallback(() => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(() => {
        const canvas = ref as React.RefObject<HTMLCanvasElement>;
        const ctx = canvas.current?.getContext('2d', { alpha: true });
        if (!canvas.current || !ctx) return;

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
      });
    }, [ref, drawImages, drawTexts]);

    useEffect(() => {
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, []);

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
    }, [isTextingMode, textInput.isVisible, textInput.text, completeText, cancelText, ref]);

    useEffect(() => {
      const canvas = ref as React.RefObject<HTMLCanvasElement>;
      if (!canvas.current) return;

      const resizeObserver = new ResizeObserver(updateCanvas);
      const container = canvas.current.parentElement?.parentElement;

      if (container) {
        resizeObserver.observe(container);
      }

      updateCanvas();
      return () => resizeObserver.disconnect();
    }, [ref, updateCanvas]);

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && textInput.isVisible) {
          cancelText();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [textInput.isVisible, cancelText]);

    const canvasStyle: CSSProperties = {
      cursor: drawingState.isTexting ? 'text' : 'default',
      pointerEvents: isTextingMode ? 'auto' : 'none',
    };

    const inputContainerStyle: CSSProperties = {
      left: textInput.position.x,
      top: textInput.position.y - drawingState.textTool.width * 0.5,
      zIndex: 100,
    };

    const inputStyle: CSSProperties = {
      color: drawingState.textTool.color,
      fontSize: `${drawingState.textTool.width}px`,
      lineHeight: '1',
    };

    return (
      <>
        <canvas
          ref={ref}
          onMouseDown={handleMouseDown}
          className={`absolute left-0 top-0 h-full w-full ${className} image-text-canvas`}
          style={canvasStyle}
        />
        {textInput.isVisible && isTextingMode && (
          <div className="absolute" style={inputContainerStyle}>
            <input
              id="text-input"
              type="text"
              value={textInput.text}
              onChange={handleTextChange}
              onKeyDown={handleInputKeyDown}
              className="m-0 min-w-[100px] border-none bg-transparent p-0 outline-none"
              style={inputStyle}
              autoFocus
              placeholder="텍스트 입력"
            />
          </div>
        )}
      </>
    );
  },
);
