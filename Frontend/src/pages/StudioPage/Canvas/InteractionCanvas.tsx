import { useEffect, useState, forwardRef, useCallback } from 'react';
import { useCanvasElement } from '@hooks/canvas/useCanvasElement';
import { Position, Point, CanvasImage, CanvasText, InteractionCanvasProps } from '@/types/canvas';
import { CanvasElementDeleteModal } from '../Modals/CanvasElementDeleteModal';
import { useStudioStore } from '@/store/useStudioStore';
import { throttle } from 'lodash';

type SelectedElement = 'screen' | 'camera' | 'text' | 'image' | null;

export const InteractionCanvas = forwardRef<HTMLCanvasElement, InteractionCanvasProps>(
  ({ isDrawingMode, isTextingMode, className }, forwardedRef) => {
    const [selectedElement, setSelectedElement] = useState<SelectedElement>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [screenAspectRatio, setScreenAspectRatio] = useState(16 / 9);

    const cameraAspectRatio = 4 / 3;

    const {
      screenStream,
      mediaStream,
      screenPosition,
      camPosition,
      texts,
      images,
      setScreenPosition,
      setCamPosition,
      setTexts,
      setImages,
      setDeleteModal,
    } = useStudioStore();

    useEffect(() => {
      if (screenStream) {
        const videoTrack = screenStream.getVideoTracks()[0];
        if (videoTrack) {
          const settings = videoTrack.getSettings();
          if (settings.width && settings.height) {
            setScreenAspectRatio(settings.width / settings.height);
          }
        }
      }
    }, [screenStream]);

    const getCanvasElement = (): HTMLCanvasElement | null => {
      if (!forwardedRef) return null;
      return 'current' in forwardedRef ? forwardedRef.current : null;
    };

    const handleElementRightClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
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
        setDeleteModal({
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
        setDeleteModal({
          show: true,
          x: e.clientX,
          y: e.clientY,
          type: 'image',
          targetId: clickedImage.id,
        });
      }
    };

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setSelectedElement(null);
          setSelectedId(null);

          setDeleteModal({
            show: false,
            x: 0,
            y: 0,
            type: 'text',
            targetId: '',
          });
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

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
      minSize: selectedElement === 'text' ? 1 : selectedElement === 'screen' ? 200 : 100,
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
      [selectedId, images, screenAspectRatio],
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
            const updatedTexts: CanvasText[] = texts.map(text => {
              if (text.id === selectedId) {
                return {
                  ...text,
                  position: newPosition,
                };
              }
              return text;
            });
            setTexts(updatedTexts);
            break;
          }
          case 'image': {
            const updatedImages: CanvasImage[] = images.map(image => {
              if (image.id === selectedId) {
                return {
                  ...image,
                  position: newPosition,
                };
              }
              return image;
            });
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

    const handleMouseMoveCore = (e: React.MouseEvent<HTMLCanvasElement>) => {
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

    const handleMouseMove = throttle(handleMouseMoveCore, 16, {
      leading: true,
      trailing: true,
    });

    useEffect(() => {
      const handleGlobalClick = (e: MouseEvent) => {
        const canvas = getCanvasElement();

        if (!canvas || !(e.target instanceof HTMLCanvasElement) || e.target !== canvas) {
          setSelectedElement(null);
          setSelectedId(null);
        }

        setDeleteModal({
          show: false,
          x: 0,
          y: 0,
          type: 'text',
          targetId: '',
        });
      };

      window.addEventListener('click', handleGlobalClick);
      return () => window.removeEventListener('click', handleGlobalClick);
    }, []);

    useEffect(() => {
      const handleGlobalMouseMoveCore = (e: MouseEvent) => {
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

      const handleGlobalMouseMove = throttle(handleGlobalMouseMoveCore, 16, {
        leading: true,
        trailing: true,
      });

      const handleGlobalMouseUp = () => {
        if (isDrawingMode || isTextingMode) return;
        setIsDragging(false);
        handleResizeEnd();
      };

      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        handleGlobalMouseMove.cancel();
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }, [
      isDrawingMode,
      isTextingMode,
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
          className={`absolute left-0 top-0 h-full w-full ${className}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={() => handleResizeEnd()}
          onContextMenu={handleElementRightClick}
          style={{
            pointerEvents: !isDrawingMode && !isTextingMode ? 'auto' : 'none',
          }}
        />
        <CanvasElementDeleteModal canvasRef={forwardedRef} />
      </>
    );
  },
);

InteractionCanvas.displayName = 'InteractionCanvas';

export default InteractionCanvas;
