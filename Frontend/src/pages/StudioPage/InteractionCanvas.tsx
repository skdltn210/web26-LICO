import { useEffect, useState, forwardRef, useCallback } from 'react';
import { useCanvasElement } from '@hooks/canvas/useCanvasElement';
import { Position, Point } from '@/types/canvas';
import { CanvasElementDeleteModal } from './Modals/CanvasElementDeleteModal';
import { useStudioStore } from '@store/useStudioStore';

type SelectedElement = 'screen' | 'camera' | 'text' | 'image' | null;

interface ContextMenu {
  show: boolean;
  x: number;
  y: number;
  type: 'text' | 'image';
  targetId: string;
}

interface InteractionCanvasProps {
  screenStream: MediaStream | null;
  mediaStream: MediaStream | null;
  screenPosition: Position;
  camPosition: Position;
  setScreenPosition: (position: Position | ((prev: Position) => Position)) => void;
  setCamPosition: (position: Position | ((prev: Position) => Position)) => void;
  isDrawingMode: boolean;
}

export const InteractionCanvas = forwardRef<HTMLCanvasElement, InteractionCanvasProps>(
  (
    { screenStream, mediaStream, screenPosition, camPosition, setScreenPosition, setCamPosition, isDrawingMode },
    forwardedRef,
  ) => {
    const texts = useStudioStore(state => state.texts);
    const images = useStudioStore(state => state.images);
    const setTexts = useStudioStore(state => state.setTexts);
    const setImages = useStudioStore(state => state.setImages);

    const [selectedElement, setSelectedElement] = useState<SelectedElement>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const [contextMenu, setContextMenu] = useState<ContextMenu>({
      show: false,
      x: 0,
      y: 0,
      type: 'text',
      targetId: '',
    });

    const screenAspectRatio = 16 / 9;
    const cameraAspectRatio = 4 / 3;

    const getCanvasElement = (): HTMLCanvasElement | null => {
      if (!forwardedRef) return null;
      return 'current' in forwardedRef ? forwardedRef.current : null;
    };

    const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const point = getCanvasPoint(e);
      const scale = getScale();

      const adjustedPoint = {
        x: point.x / scale,
        y: point.y / scale,
      };

      const clickedText = texts.find(
        text =>
          adjustedPoint.x >= text.position.x &&
          adjustedPoint.x <= text.position.x + text.position.width &&
          adjustedPoint.y >= text.position.y &&
          adjustedPoint.y <= text.position.y + text.position.height,
      );

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

      const clickedImage = images.find(
        image =>
          adjustedPoint.x >= image.position.x &&
          adjustedPoint.x <= image.position.x + image.position.width &&
          adjustedPoint.y >= image.position.y &&
          adjustedPoint.y <= image.position.y + image.position.height,
      );

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
        const updatedTexts = texts.filter(text => text.id !== contextMenu.targetId);
        setTexts(updatedTexts);
      } else {
        const updatedImages = images.filter(image => image.id !== contextMenu.targetId);
        setImages(updatedImages);
      }
      setContextMenu(prev => ({ ...prev, show: false }));
    };

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && contextMenu.show) {
          setContextMenu(prev => ({ ...prev, show: false }));
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [contextMenu.show]);

    const getScale = (): number => {
      return window.devicePixelRatio;
    };

    const getCanvasPoint = (e: MouseEvent | React.MouseEvent): Point => {
      const canvas = getCanvasElement();
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const scale = getScale();

      return {
        x: (e.clientX - rect.left) * scale,
        y: (e.clientY - rect.top) * scale,
      };
    };

    const isPointInInteractionArea = (x: number, y: number): boolean => {
      const canvas = getCanvasElement();
      if (!canvas) return false;
      return x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height;
    };

    const isPointInElement = (x: number, y: number, position: Position): boolean => {
      const scale = getScale();
      const scaledPosition = {
        x: position.x * scale,
        y: position.y * scale,
        width: position.width * scale,
        height: position.height * scale,
      };

      return (
        x >= scaledPosition.x &&
        x <= scaledPosition.x + scaledPosition.width &&
        y >= scaledPosition.y &&
        y <= scaledPosition.y + scaledPosition.height
      );
    };

    const getCurrentPosition = useCallback((): Position | null => {
      if (!selectedElement || (selectedElement !== 'camera' && selectedElement !== 'screen' && !selectedId)) {
        return null;
      }

      switch (selectedElement) {
        case 'camera':
          return camPosition;
        case 'screen':
          return screenPosition;
        case 'text':
          return texts.find(t => t.id === selectedId)?.position || null;
        case 'image':
          return images.find(i => i.id === selectedId)?.position || null;
        default:
          return null;
      }
    }, [selectedElement, selectedId, camPosition, screenPosition, texts, images]);

    const {
      drawResizeHandles,
      getResizeHandle,
      getResizeCursor,
      handleResizeStart,
      handleResize,
      handleResizeEnd,
      isResizing,
    } = useCanvasElement({
      minSize: selectedElement === 'text' ? 1 : selectedElement === 'screen' ? 200 : 50,
      canvasWidth: getCanvasElement()?.width || 0,
      canvasHeight: getCanvasElement()?.height || 0,
    });

    const maintainAspectRatio = useCallback(
      (newPosition: Position, elementType: SelectedElement): Position => {
        if (!elementType) return newPosition;

        let aspectRatio = 1;
        switch (elementType) {
          case 'camera':
            aspectRatio = cameraAspectRatio;
            break;
          case 'screen':
            aspectRatio = screenAspectRatio;
            break;
          case 'image':
            const selectedImage = images.find(i => i.id === selectedId);
            if (selectedImage) {
              aspectRatio = selectedImage.aspectRatio;
            }
            break;
          case 'text':
            return newPosition;
        }

        const width = newPosition.width;
        const height = width / aspectRatio;
        return { ...newPosition, height };
      },
      [selectedId, images],
    );

    const updateElementPosition = useCallback(
      (newPosition: Position) => {
        if (!selectedElement) return;

        if (selectedElement === 'camera') {
          setCamPosition(newPosition);
          return;
        }

        if (selectedElement === 'screen') {
          setScreenPosition(newPosition);
          return;
        }

        if (!selectedId) return;

        switch (selectedElement) {
          case 'text': {
            const updatedTexts = texts.map(text =>
              text.id === selectedId ? { ...text, position: newPosition } : text,
            );
            setTexts(updatedTexts);
            break;
          }
          case 'image': {
            const updatedImages = images.map(image =>
              image.id === selectedId ? { ...image, position: newPosition } : image,
            );
            setImages(updatedImages);
            break;
          }
        }
      },
      [selectedElement, selectedId, setCamPosition, setScreenPosition, setTexts, setImages, texts, images],
    );

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (isDrawingMode) return;

      const point = getCanvasPoint(e);
      if (!isPointInInteractionArea(point.x, point.y)) {
        setSelectedElement(null);
        setSelectedId(null);
        return;
      }

      if (selectedElement) {
        const currentPosition = getCurrentPosition();
        if (currentPosition) {
          const scale = getScale();
          const scaledPosition = {
            ...currentPosition,
            x: currentPosition.x * scale,
            y: currentPosition.y * scale,
            width: currentPosition.width * scale,
            height: currentPosition.height * scale,
          };
          const resizeStarted = handleResizeStart(point.x, point.y, scaledPosition);
          if (resizeStarted) return;
        }
      }

      const scale = getScale();

      const clickedText = texts.find(text => isPointInElement(point.x, point.y, text.position));
      if (clickedText) {
        setSelectedElement('text');
        setSelectedId(clickedText.id);
        setIsDragging(true);
        setDragStart({
          x: point.x - clickedText.position.x * scale,
          y: point.y - clickedText.position.y * scale,
        });
        return;
      }

      const clickedImage = images.find(image => isPointInElement(point.x, point.y, image.position));
      if (clickedImage) {
        setSelectedElement('image');
        setSelectedId(clickedImage.id);
        setIsDragging(true);
        setDragStart({
          x: point.x - clickedImage.position.x * scale,
          y: point.y - clickedImage.position.y * scale,
        });
        return;
      }

      const isClickingCamera = mediaStream && isPointInElement(point.x, point.y, camPosition);
      if (isClickingCamera) {
        setSelectedElement('camera');
        setSelectedId(null);
        setIsDragging(true);
        setDragStart({
          x: point.x - camPosition.x * scale,
          y: point.y - camPosition.y * scale,
        });
        return;
      }

      const isClickingScreen = screenStream && isPointInElement(point.x, point.y, screenPosition);
      if (isClickingScreen) {
        setSelectedElement('screen');
        setSelectedId(null);
        setIsDragging(true);
        setDragStart({
          x: point.x - screenPosition.x * scale,
          y: point.y - screenPosition.y * scale,
        });
        return;
      }

      setSelectedElement(null);
      setSelectedId(null);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (isDrawingMode) return;

      const point = getCanvasPoint(e);
      const canvas = getCanvasElement();
      if (!canvas) return;

      if (!isPointInInteractionArea(point.x, point.y)) {
        canvas.style.cursor = 'default';
        return;
      }

      if (selectedElement) {
        const currentPosition = getCurrentPosition();
        if (currentPosition) {
          const scale = getScale();
          const scaledPosition = {
            x: currentPosition.x * scale,
            y: currentPosition.y * scale,
            width: currentPosition.width * scale,
            height: currentPosition.height * scale,
          };

          const resizeHandle = getResizeHandle(point.x, point.y, scaledPosition);
          if (resizeHandle) {
            canvas.style.cursor = getResizeCursor(resizeHandle);
          } else if (isPointInElement(point.x, point.y, currentPosition)) {
            canvas.style.cursor = 'move';
          } else {
            canvas.style.cursor = 'default';
          }
        }
      }
    };

    useEffect(() => {
      const handleGlobalClick = (e: MouseEvent) => {
        const canvas = getCanvasElement();
        const modalElement = document.querySelector('.canvas-element-delete-modal');

        if (modalElement && !modalElement.contains(e.target as Node)) {
          setContextMenu(prev => ({ ...prev, show: false }));
        }

        if (!canvas || !(e.target instanceof HTMLCanvasElement) || e.target !== canvas) {
          setSelectedElement(null);
          setSelectedId(null);
        }
      };

      window.addEventListener('click', handleGlobalClick);
      return () => window.removeEventListener('click', handleGlobalClick);
    }, []);

    useEffect(() => {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (isDrawingMode || (!isDragging && !isResizing)) return;

        const canvas = getCanvasElement();
        if (!canvas) return;

        const container = canvas.parentElement?.parentElement;
        if (!container) return;

        const point = getCanvasPoint(e);
        const scale = getScale();

        if (selectedElement) {
          const currentPosition = getCurrentPosition();
          if (!currentPosition) return;

          if (isResizing) {
            const scaledPosition = {
              x: currentPosition.x * scale,
              y: currentPosition.y * scale,
              width: currentPosition.width * scale,
              height: currentPosition.height * scale,
            };

            const newPosition = handleResize(point.x, point.y, scaledPosition);
            if (newPosition) {
              const unscaledPosition = {
                x: newPosition.x / scale,
                y: newPosition.y / scale,
                width: newPosition.width / scale,
                height: newPosition.height / scale,
              };

              const adjustedPosition = maintainAspectRatio(unscaledPosition, selectedElement);

              updateElementPosition({
                ...adjustedPosition,
                x: Math.max(0, Math.min(adjustedPosition.x, container.clientWidth - adjustedPosition.width)),
                y: Math.max(0, Math.min(adjustedPosition.y, container.clientHeight - adjustedPosition.height)),
                width: Math.min(adjustedPosition.width, container.clientWidth),
                height: Math.min(adjustedPosition.height, container.clientHeight),
              });
            }
          } else if (isDragging) {
            const newX = point.x / scale - dragStart.x / scale;
            const newY = point.y / scale - dragStart.y / scale;

            updateElementPosition({
              ...currentPosition,
              x: Math.max(0, Math.min(container.clientWidth - currentPosition.width, newX)),
              y: Math.max(0, Math.min(container.clientHeight - currentPosition.height, newY)),
            });
          }
        }
      };

      const handleGlobalMouseUp = () => {
        setIsDragging(false);
        handleResizeEnd();
      };

      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }, [
      isDrawingMode,
      isDragging,
      isResizing,
      selectedElement,
      selectedId,
      dragStart,
      updateElementPosition,
      maintainAspectRatio,
      getCurrentPosition,
    ]);

    useEffect(() => {
      const canvas = getCanvasElement();
      const ctx = canvas?.getContext('2d');

      if (!canvas || !ctx) return;

      const scale = getScale();
      const container = canvas.parentElement?.parentElement;
      if (!container) return;

      canvas.width = container.clientWidth * scale;
      canvas.height = container.clientHeight * scale;
      canvas.style.width = `${container.clientWidth}px`;
      canvas.style.height = `${container.clientHeight}px`;

      ctx.scale(scale, scale);
      ctx.clearRect(0, 0, canvas.width / scale, canvas.height / scale);

      if (selectedElement) {
        const currentPosition = getCurrentPosition();
        if (currentPosition) {
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.strokeRect(currentPosition.x, currentPosition.y, currentPosition.width, currentPosition.height);

          drawResizeHandles(ctx, {
            x: currentPosition.x * scale,
            y: currentPosition.y * scale,
            width: currentPosition.width * scale,
            height: currentPosition.height * scale,
          });

          if (selectedElement === 'text') {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(currentPosition.x, currentPosition.y, currentPosition.width, currentPosition.height);
          }
        }
      }
    }, [
      selectedElement,
      selectedId,
      camPosition,
      screenPosition,
      texts,
      images,
      drawResizeHandles,
      getCurrentPosition,
    ]);

    return (
      <>
        <canvas
          ref={forwardedRef}
          className={`absolute left-0 top-0 h-full w-full ${isDrawingMode ? 'z-10' : 'z-20'}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={() => handleResizeEnd()}
          onContextMenu={handleContextMenu}
        />
        <CanvasElementDeleteModal
          show={contextMenu.show}
          x={contextMenu.x}
          y={contextMenu.y}
          onDelete={handleDelete}
          canvasRef={forwardedRef}
        />
      </>
    );
  },
);

InteractionCanvas.displayName = 'InteractionCanvas';

export default InteractionCanvas;
