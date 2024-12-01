import { useCallback } from 'react';
import { useStudioStore } from '@/store/useStudioStore';

export function useImage() {
  const images = useStudioStore(state => state.images);
  const setImages = useStudioStore(state => state.setImages);

  const calculateImageDimensions = useCallback(
    (originalWidth: number, originalHeight: number, containerWidth: number, containerHeight: number) => {
      let width = originalWidth;
      let height = originalHeight;

      if (width > containerWidth || height > containerHeight) {
        const widthRatio = containerWidth / width;
        const heightRatio = containerHeight / height;
        const scale = Math.min(widthRatio, heightRatio);

        width = width * scale;
        height = height * scale;
      }

      return {
        width,
        height,
        originalWidth,
        originalHeight,
      };
    },
    [],
  );

  const addImage = useCallback(
    async (file: File) => {
      return new Promise<void>((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = e => {
          const img = new Image();

          img.onload = () => {
            const drawCanvas = document.querySelector<HTMLCanvasElement>('.draw-canvas');
            if (!drawCanvas) {
              return reject(new Error('DrawCanvas not found'));
            }

            const container = drawCanvas.parentElement?.parentElement;
            if (!container) {
              return reject(new Error('Container not found'));
            }

            const dimensions = calculateImageDimensions(
              img.width,
              img.height,
              container.clientWidth,
              container.clientHeight,
            );

            const position = {
              x: (container.clientWidth - dimensions.width) / 2,
              y: (container.clientHeight - dimensions.height) / 2,
              width: dimensions.width,
              height: dimensions.height,
            };

            const offscreenCanvas = document.createElement('canvas');
            offscreenCanvas.width = dimensions.originalWidth;
            offscreenCanvas.height = dimensions.originalHeight;

            const offscreenCtx = offscreenCanvas.getContext('2d');
            if (!offscreenCtx) {
              return reject(new Error('Failed to get offscreen context'));
            }

            offscreenCtx.drawImage(img, 0, 0, dimensions.originalWidth, dimensions.originalHeight);

            const newImage = {
              id: crypto.randomUUID(),
              element: offscreenCanvas,
              position,
              aspectRatio: img.width / img.height,
              originalWidth: dimensions.originalWidth,
              originalHeight: dimensions.originalHeight,
            };

            setImages([...images, newImage]);
            resolve();
          };

          img.onerror = () => {
            reject(new Error('Failed to load image'));
          };

          img.src = e.target?.result as string;
        };

        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };

        reader.readAsDataURL(file);
      });
    },
    [images, setImages, calculateImageDimensions],
  );

  const drawImages = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!ctx) return;

      images.forEach(image => {
        if (image && image.element) {
          ctx.save();
          ctx.drawImage(
            image.element,
            0,
            0,
            image.originalWidth,
            image.originalHeight,
            image.position.x,
            image.position.y,
            image.position.width,
            image.position.height,
          );
          ctx.restore();
        }
      });
    },
    [images],
  );

  return {
    images,
    addImage,
    drawImages,
  };
}
