import { Point, CanvasImage } from '@/types/canvas';
import { useCanvasContext } from '@/contexts/CanvasContext';

export function useImage() {
  const { images, setImages } = useCanvasContext();

  const calculateImageDimensions = (
    originalWidth: number,
    originalHeight: number,
    containerWidth: number,
    containerHeight: number,
  ) => {
    const maxWidth = containerWidth * 0.8;
    const maxHeight = containerHeight * 0.8;
    const aspectRatio = originalWidth / originalHeight;
    let width = originalWidth;
    let height = originalHeight;

    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }

    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    width = Math.round(width);
    height = Math.round(height);

    return { width, height };
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

          const rect = drawCanvas.getBoundingClientRect();
          const containerWidth = rect.width;
          const containerHeight = rect.height;

          const { width, height } = calculateImageDimensions(img.width, img.height, containerWidth, containerHeight);

          const position: Point = {
            x: Math.round((containerWidth - width) / 2),
            y: Math.round((containerHeight - height) / 2),
          };

          const newImage: CanvasImage = {
            id: crypto.randomUUID(),
            element: img,
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
      if (image && image.element && image.element.complete) {
        ctx.save();
        ctx.drawImage(
          image.element,
          image.position.x * scale,
          image.position.y * scale,
          image.width * scale,
          image.height * scale,
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
