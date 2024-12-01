import { Position, CanvasImage } from '@/types/canvas';
import { useCanvasContext } from '@/contexts/CanvasContext';

export function useImage() {
  const { images, setImages } = useCanvasContext();

  const calculateImageDimensions = (
    originalWidth: number,
    originalHeight: number,
    containerWidth: number,
    containerHeight: number,
  ) => {
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
  };

  const addImage = async (file: File) => {
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

          const { width, height, originalWidth, originalHeight } = calculateImageDimensions(
            img.width,
            img.height,
            container.clientWidth,
            container.clientHeight,
          );

          const position: Position = {
            x: (container.clientWidth - width) / 2,
            y: (container.clientHeight - height) / 2,
            width: width,
            height: height,
          };

          const offscreenCanvas = document.createElement('canvas');
          offscreenCanvas.width = originalWidth;
          offscreenCanvas.height = originalHeight;

          const offscreenCtx = offscreenCanvas.getContext('2d');
          if (!offscreenCtx) {
            return reject(new Error('Failed to get offscreen context'));
          }

          offscreenCtx.drawImage(img, 0, 0, originalWidth, originalHeight);

          const newImage: CanvasImage = {
            id: crypto.randomUUID(),
            element: offscreenCanvas,
            position,
            aspectRatio: originalWidth / originalHeight,
            originalWidth,
            originalHeight,
          };

          setImages(prevImages => [...prevImages, newImage]);
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
  };

  const drawImages = (ctx: CanvasRenderingContext2D) => {
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
  };

  return {
    addImage,
    drawImages,
  };
}
