import { Point, CanvasImage } from '@/types/canvas';
import { useCanvasContext } from '@/contexts/CanvasContext';

export function useImage() {
  const { images, setImages } = useCanvasContext();

  const calculateImageDimensions = (originalWidth: number, originalHeight: number) => {
    return {
      width: originalWidth,
      height: originalHeight,
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

          const { width, height } = calculateImageDimensions(img.width, img.height);

          const position: Point = {
            x: 0,
            y: 0,
          };

          const offscreenCanvas = document.createElement('canvas');
          offscreenCanvas.width = width;
          offscreenCanvas.height = height;

          const offscreenCtx = offscreenCanvas.getContext('2d');
          if (!offscreenCtx) {
            return reject(new Error('Failed to get offscreen context'));
          }

          offscreenCtx.drawImage(img, 0, 0, width, height);

          const newImage: CanvasImage = {
            id: crypto.randomUUID(),
            element: offscreenCanvas,
            position,
            width,
            height,
            aspectRatio: img.width / img.height,
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
  };

  const drawImages = (ctx: CanvasRenderingContext2D) => {
    if (!ctx) return;

    const scale = window.devicePixelRatio;

    images.forEach(image => {
      if (image && image.element) {
        ctx.save();
        ctx.drawImage(image.element, image.position.x, image.position.y, image.width / scale, image.height / scale);
        ctx.restore();
      }
    });
  };

  return {
    addImage,
    drawImages,
  };
}
