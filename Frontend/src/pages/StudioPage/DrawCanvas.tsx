import { useState, useEffect, forwardRef } from 'react';
import { useDrawing } from '@hooks/canvas/useDrawing';
import { useText } from '@hooks/canvas/useText';
import { useImage } from '@hooks/canvas/useImage';
import { Point } from '@/types/canvas';
import pencilCursor from '@assets/icons/pencilCursor.svg?url';
import eraserCursor from '@assets/icons/eraserCursor.svg?url';
import { useCanvasContext } from '@/contexts/CanvasContext';
import { CanvasElementDeleteModal } from './Modals/CanvasElementDeleteModal';

interface ContextMenu {
  show: boolean;
  x: number;
  y: number;
  type: 'text' | 'image';
  targetId: string;
}

interface DrawCanvasProps {
  drawingState: {
    isDrawing: boolean;
    isErasing: boolean;
    isTexting: boolean;
    drawTool: { color: string; width: number };
    eraseTool: { width: number };
    textTool: { color: string; width: number };
  };
  style?: React.CSSProperties;
}

export const DrawCanvas = forwardRef<HTMLCanvasElement, DrawCanvasProps>(({ drawingState, style }, ref) => {
  const { paths, startDrawing, continueDrawing, endDrawing } = useDrawing();
  const { textInput, startTextInput, updateText, completeText, cancelText, drawTexts } = useText({
    color: drawingState.textTool.color,
    fontSize: drawingState.textTool.width,
  });
  const { drawImages } = useImage();
  const { texts, setTexts, images, setImages } = useCanvasContext();

  const [contextMenu, setContextMenu] = useState<ContextMenu>({
    show: false,
    x: 0,
    y: 0,
    type: 'text',
    targetId: '',
  });

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
    const handleClick = () => {
      setContextMenu(prev => ({ ...prev, show: false }));
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleCanvasContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const point = getCanvasPoint(e);

    const clickedText = texts.find(text => {
      const canvas = (ref as React.RefObject<HTMLCanvasElement>).current;
      if (!canvas) return false;

      const ctx = canvas.getContext('2d');
      if (!ctx) return false;

      ctx.font = `${text.fontSize}px Arial`;
      const metrics = ctx.measureText(text.text);

      return (
        point.x >= text.position.x &&
        point.x <= text.position.x + metrics.width &&
        point.y >= text.position.y &&
        point.y <= text.position.y + text.fontSize
      );
    });

    if (clickedText) {
      setContextMenu({
        show: true,
        x: e.clientX,
        y: e.clientY,
        type: 'text',
        targetId: clickedText.id,
      });
      return;
    }

    const clickedImage = images.find(image => {
      return (
        point.x >= image.position.x &&
        point.x <= image.position.x + image.width &&
        point.y >= image.position.y &&
        point.y <= image.position.y + image.height
      );
    });

    if (clickedImage) {
      setContextMenu({
        show: true,
        x: e.clientX,
        y: e.clientY,
        type: 'image',
        targetId: clickedImage.id,
      });
    }
  };

  const handleDelete = () => {
    if (contextMenu.type === 'text') {
      setTexts(texts.filter(text => text.id !== contextMenu.targetId));
    } else {
      setImages(images.filter(image => image.id !== contextMenu.targetId));
    }
    setContextMenu(prev => ({ ...prev, show: false }));
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
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        onContextMenu={handleCanvasContextMenu}
        style={style}
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
      <CanvasElementDeleteModal
        show={contextMenu.show}
        x={contextMenu.x}
        y={contextMenu.y}
        onDelete={handleDelete}
        canvasRef={ref}
      />
    </>
  );
});
