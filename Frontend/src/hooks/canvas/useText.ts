import { useState } from 'react';
import { Point, UseTextProps, TextInputState, CanvasText } from '@/types/canvas';
import { useCanvasContext } from '@contexts/CanvasContext';

export function useText({ color, fontSize: initialFontSize }: UseTextProps) {
  const { texts, setTexts } = useCanvasContext();

  const [textInput, setTextInput] = useState<TextInputState>({
    isVisible: false,
    text: '',
    position: { x: 0, y: 0, width: 0, height: 0 },
  });

  const calculateTextDimensions = (ctx: CanvasRenderingContext2D, text: string, fontSize: number) => {
    ctx.font = `${fontSize}px Arial`;
    const metrics = ctx.measureText(text);

    const width = Math.abs(metrics.actualBoundingBoxLeft) + Math.abs(metrics.actualBoundingBoxRight);
    const height = Math.abs(metrics.actualBoundingBoxAscent) + Math.abs(metrics.actualBoundingBoxDescent);

    const padding = fontSize * 0.1;

    return {
      width: width + padding * 2,
      height: height + padding * 2,
    };
  };

  const startTextInput = (point: Point) => {
    setTextInput({
      isVisible: true,
      text: '',
      position: {
        x: point.x,
        y: point.y,
        width: 0,
        height: initialFontSize,
      },
    });
  };

  const updateText = (text: string) => {
    const singleLineText = text.replace(/\n/g, ' ');

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (ctx) {
      const dimensions = calculateTextDimensions(ctx, singleLineText, initialFontSize);

      setTextInput(prev => ({
        ...prev,
        text: singleLineText,
        position: {
          ...prev.position,
          ...dimensions,
        },
      }));
    }
  };

  const completeText = (ctx: CanvasRenderingContext2D | null) => {
    if (!ctx || !textInput.text.trim()) {
      setTextInput({
        isVisible: false,
        text: '',
        position: { x: 0, y: 0, width: 0, height: 0 },
      });
      return;
    }

    const dimensions = calculateTextDimensions(ctx, textInput.text, initialFontSize);

    const newText: CanvasText = {
      id: crypto.randomUUID(),
      text: textInput.text,
      position: {
        ...textInput.position,
        ...dimensions,
      },
      color,
      fontSize: initialFontSize,
      originalFontSize: initialFontSize,
    };

    setTexts(prevTexts => [...prevTexts, newText]);

    setTextInput({
      isVisible: false,
      text: '',
      position: { x: 0, y: 0, width: 0, height: 0 },
    });
  };

  const cancelText = () => {
    setTextInput({
      isVisible: false,
      text: '',
      position: { x: 0, y: 0, width: 0, height: 0 },
    });
  };

  const drawTexts = (ctx: CanvasRenderingContext2D) => {
    texts.forEach(text => {
      ctx.save();

      const heightScale = text.position.height / text.originalFontSize;
      const scaledFontSize = text.originalFontSize * heightScale;

      ctx.font = `${scaledFontSize}px Arial`;
      ctx.fillStyle = text.color;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';

      const textX = text.position.x + text.position.width / 2;
      const textY = text.position.y + text.position.height / 2;

      ctx.fillText(text.text, textX, textY);
      ctx.restore();
    });
  };

  return {
    textInput,
    texts,
    startTextInput,
    updateText,
    completeText,
    cancelText,
    drawTexts,
  };
}
