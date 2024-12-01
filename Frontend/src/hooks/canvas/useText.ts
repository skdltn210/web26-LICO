import { useState } from 'react';
import { Point } from '@/types/canvas';
import { UseTextProps, TextInputState, CanvasText } from '@/types/canvas';
import { useCanvasContext } from '@/contexts/CanvasContext';

export function useText({ color, fontSize: initialFontSize }: UseTextProps) {
  const { texts, setTexts } = useCanvasContext();
  const [textInput, setTextInput] = useState<TextInputState>({
    isVisible: false,
    text: '',
    position: { x: 0, y: 0, width: 0, height: 0 },
  });

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
      ctx.font = `${initialFontSize}px Arial`;
      const metrics = ctx.measureText(singleLineText);

      const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

      setTextInput(prev => ({
        ...prev,
        text: singleLineText,
        position: {
          ...prev.position,
          width: metrics.width,
          height: textHeight || initialFontSize,
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

    ctx.font = `${initialFontSize}px Arial`;
    const metrics = ctx.measureText(textInput.text);
    const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

    const newText: CanvasText = {
      id: crypto.randomUUID(),
      text: textInput.text,
      position: {
        ...textInput.position,
        width: metrics.width,
        height: textHeight || initialFontSize,
      },
      color,
      fontSize: initialFontSize,
      originalFontSize: initialFontSize,
    };
    setTexts([...texts, newText]);

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
      ctx.textBaseline = 'top';

      const metrics = ctx.measureText(text.text);
      const actualTextHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

      const yOffset = (text.position.height - actualTextHeight) / 2;

      ctx.fillText(text.text, text.position.x, text.position.y + yOffset);

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
