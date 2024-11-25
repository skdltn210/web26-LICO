import { useEffect, useRef, useState } from 'react';
import { useCanvasElement } from '@hooks/useCanvasElement';
import { useDrawing } from '@hooks/useDrawing';
import { useText } from '@hooks/useText';
import { WebRTCStream } from './WebRTCStream';
import { Position, StreamContainerProps, Point } from '@/types/canvas';
import pencilCursor from '@assets/icons/pencilCursor.svg';
import eraserCursor from '@assets/icons/eraserCursor.svg';

type SelectedElement = 'screen' | 'camera' | null;

export default function StreamContainer({
  screenStream,
  mediaStream,
  isStreaming,
  webrtcUrl,
  streamKey,
  onStreamError,
  drawingState,
}: StreamContainerProps) {
  const videoCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const mediaVideoRef = useRef<HTMLVideoElement>(null);
  const webrtcRef = useRef<WebRTCStream | null>(null);
  const animationFrameRef = useRef<number>();

  const [screenAspectRatio, setScreenAspectRatio] = useState(16 / 9);
  const [cameraAspectRatio, setCameraAspectRatio] = useState(4 / 3);
  const [screenPosition, setScreenPosition] = useState<Position>({ x: 0, y: 0, width: 100, height: 100 });
  const [camPosition, setCamPosition] = useState<Position>({ x: 20, y: 20, width: 240, height: 180 });
  const [selectedElement, setSelectedElement] = useState<SelectedElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const { paths, startDrawing, continueDrawing, endDrawing } = useDrawing();
  const { textInput, startTextInput, updateText, completeText, cancelText, drawTexts } = useText({
    color: drawingState.textTool.color,
    fontSize: drawingState.textTool.width,
  });

  const getIsCamFlipped = () => {
    if (!mediaStream) return false;
    return (mediaStream as any).isCamFlipped || false;
  };

  const canvas = canvasRef.current;
  const {
    drawResizeHandles,
    getResizeHandle,
    getResizeCursor,
    handleResizeStart,
    handleResize,
    handleResizeEnd,
    isResizing,
  } = useCanvasElement({
    minSize: selectedElement === 'camera' ? 100 : 200,
    canvasWidth: canvas?.width || 0,
    canvasHeight: canvas?.height || 0,
  });

  useEffect(() => {
    if (!webrtcRef.current && webrtcUrl && streamKey) {
      webrtcRef.current = new WebRTCStream(webrtcUrl, streamKey);
    }

    return () => {
      if (webrtcRef.current) {
        webrtcRef.current.stop();
        webrtcRef.current = null;
      }
    };
  }, [webrtcUrl, streamKey]);

  useEffect(() => {
    const startStreaming = async () => {
      if (!videoCanvasRef.current || !canvasRef.current || !webrtcRef.current) return;

      try {
        await webrtcRef.current.start(videoCanvasRef.current, canvasRef.current, screenStream, mediaStream);
      } catch (error) {
        console.error('Streaming failed:', error);
        onStreamError?.(error as Error);
      }
    };

    if (isStreaming) {
      startStreaming();
    } else {
      webrtcRef.current?.stop();
    }
  }, [isStreaming, screenStream, mediaStream, onStreamError]);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const isClickedCamera = mediaStream && isPointInElement(x, y, camPosition);
      const isClickedScreen = screenStream && isPointInElement(x, y, screenPosition);

      if (!isClickedCamera && !isClickedScreen) {
        setSelectedElement(null);
        setIsDragging(false);
        handleResizeEnd();
      }
    };

    window.addEventListener('mousedown', handleGlobalClick);
    return () => window.removeEventListener('mousedown', handleGlobalClick);
  }, [mediaStream, screenStream, camPosition, screenPosition, handleResizeEnd]);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging && !isResizing) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const maxWidth = canvas.width / 2;
      const maxHeight = canvas.height / 2;

      if (selectedElement) {
        if (isResizing) {
          const newPosition = handleResize(x, y, selectedElement === 'camera' ? camPosition : screenPosition);
          if (newPosition) {
            const adjustedPosition = maintainAspectRatio(newPosition, selectedElement === 'camera');
            const setPosition = selectedElement === 'camera' ? setCamPosition : setScreenPosition;
            setPosition({
              ...adjustedPosition,
              x: Math.max(0, Math.min(adjustedPosition.x, maxWidth - adjustedPosition.width)),
              y: Math.max(0, Math.min(adjustedPosition.y, maxHeight - adjustedPosition.height)),
              width: Math.min(adjustedPosition.width, maxWidth),
              height: Math.min(adjustedPosition.height, maxHeight),
            });
          }
        } else if (isDragging) {
          const setPosition = selectedElement === 'camera' ? setCamPosition : setScreenPosition;
          const newX = x - dragStart.x;
          const newY = y - dragStart.y;

          setPosition(prev => ({
            ...prev,
            x: Math.max(0, Math.min(maxWidth - prev.width, newX)),
            y: Math.max(0, Math.min(maxHeight - prev.height, newY)),
          }));
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
  }, [isDragging, isResizing, selectedElement, handleResize, handleResizeEnd, camPosition, screenPosition, dragStart]);

  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
      screenVideoRef.current.onloadedmetadata = () => {
        const video = screenVideoRef.current;
        if (video) {
          setScreenAspectRatio(video.videoWidth / video.videoHeight);

          const container = canvasRef.current?.parentElement;
          if (container) {
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;
            const videoAspectRatio = video.videoWidth / video.videoHeight;

            let width = containerWidth;
            let height = containerWidth / videoAspectRatio;

            if (height > containerHeight) {
              height = containerHeight;
              width = height * videoAspectRatio;
            }

            setScreenPosition({
              x: (containerWidth - width) / 2,
              y: (containerHeight - height) / 2,
              width,
              height,
            });
          }
        }
      };
    }
  }, [screenStream]);

  useEffect(() => {
    if (mediaVideoRef.current && mediaStream) {
      mediaVideoRef.current.srcObject = mediaStream;
      mediaVideoRef.current.onloadedmetadata = () => {
        const video = mediaVideoRef.current;
        if (video) {
          setCameraAspectRatio(video.videoWidth / video.videoHeight);

          const width = 240;
          const height = width / (video.videoWidth / video.videoHeight);
          setCamPosition(prev => ({
            ...prev,
            width,
            height,
          }));
        }
      };
    }
  }, [mediaStream]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const videoCanvas = videoCanvasRef.current;
    const ctx = canvas?.getContext('2d', { alpha: true });
    const videoCtx = videoCanvas?.getContext('2d', { alpha: false });
    const screenVideo = screenVideoRef.current;
    const mediaVideo = mediaVideoRef.current;

    if (!canvas || !ctx || !videoCanvas || !videoCtx) return;

    ctx.imageSmoothingEnabled = false;
    videoCtx.imageSmoothingEnabled = false;

    const updateCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        const scale = window.devicePixelRatio;

        canvas.width = container.clientWidth * scale;
        canvas.height = container.clientHeight * scale;
        videoCanvas.width = container.clientWidth * scale;
        videoCanvas.height = container.clientHeight * scale;

        ctx.scale(scale, scale);
        videoCtx.scale(scale, scale);

        canvas.style.width = `${container.clientWidth}px`;
        canvas.style.height = `${container.clientHeight}px`;
        videoCanvas.style.width = `${container.clientWidth}px`;
        videoCanvas.style.height = `${container.clientHeight}px`;
      }

      videoCtx.clearRect(0, 0, videoCanvas.width, videoCanvas.height);
      videoCtx.fillStyle = 'black';
      videoCtx.fillRect(0, 0, videoCanvas.width, videoCanvas.height);

      if (screenVideo && screenStream) {
        videoCtx.drawImage(
          screenVideo,
          screenPosition.x,
          screenPosition.y,
          screenPosition.width,
          screenPosition.height,
        );
      }

      if (mediaVideo && mediaStream && mediaStream.getVideoTracks().length > 0) {
        videoCtx.save();
        if (getIsCamFlipped()) {
          videoCtx.translate(camPosition.x + camPosition.width, camPosition.y);
          videoCtx.scale(-1, 1);
          videoCtx.drawImage(mediaVideo, 0, 0, camPosition.width, camPosition.height);
        } else {
          videoCtx.drawImage(mediaVideo, camPosition.x, camPosition.y, camPosition.width, camPosition.height);
        }
        videoCtx.restore();
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!drawingState.isDrawing && !drawingState.isErasing && !drawingState.isTexting) {
        if (selectedElement === 'screen') {
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.strokeRect(screenPosition.x, screenPosition.y, screenPosition.width, screenPosition.height);
          drawResizeHandles(ctx, screenPosition);
        } else if (selectedElement === 'camera') {
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.strokeRect(camPosition.x, camPosition.y, camPosition.width, camPosition.height);
          drawResizeHandles(ctx, camPosition);
        }
      }

      drawPaths(ctx);
      drawTexts(ctx);

      animationFrameRef.current = requestAnimationFrame(updateCanvas);
    };

    animationFrameRef.current = requestAnimationFrame(updateCanvas);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    screenStream,
    mediaStream,
    camPosition,
    screenPosition,
    selectedElement,
    drawResizeHandles,
    paths,
    getIsCamFlipped,
    drawingState,
  ]);

  const maintainAspectRatio = (newPosition: Position, isCamera: boolean) => {
    const aspectRatio = isCamera ? cameraAspectRatio : screenAspectRatio;
    const width = newPosition.width;
    const height = width / aspectRatio;

    return {
      ...newPosition,
      height,
    };
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!textInput.isVisible) return;

      const input = document.getElementById('text-input');
      if (input && !input.contains(e.target as Node)) {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d') || null;
        completeText(ctx);
      }
    };

    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, [textInput.isVisible, completeText]);

  const isPointInElement = (x: number, y: number, position: Position): boolean => {
    return x >= position.x && x <= position.x + position.width && y >= position.y && y <= position.y + position.height;
  };

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    return { x, y };
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (drawingState.isTexting) {
      e.preventDefault();
      e.stopPropagation();
      startTextInput({ x, y });
      return;
    }
  };

  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    updateText(e.target.value);
  };

  const handleTextInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();

    if (e.key === 'Enter') {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d') || null;
      completeText(ctx);
    } else if (e.key === 'Escape') {
      cancelText();
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const point = getCanvasPoint(e);

    if (drawingState.isTexting) {
      handleCanvasClick(e);
      return;
    }

    if (drawingState.isDrawing || drawingState.isErasing) {
      startDrawing(
        point,
        drawingState.isDrawing ? drawingState.drawTool.color : '#ffffff',
        drawingState.isDrawing ? drawingState.drawTool.width : drawingState.eraseTool.width,
        drawingState.isErasing ? 'erase' : 'draw',
      );
      return;
    }

    const currentPosition = selectedElement === 'camera' ? camPosition : screenPosition;

    if (selectedElement) {
      const resizeStarted = handleResizeStart(point.x, point.y, currentPosition);
      if (resizeStarted) return;
    }

    if (mediaStream && isPointInElement(point.x, point.y, camPosition)) {
      setSelectedElement('camera');
      setIsDragging(true);
      setDragStart({
        x: point.x - camPosition.x,
        y: point.y - camPosition.y,
      });
    } else if (screenStream && isPointInElement(point.x, point.y, screenPosition)) {
      setSelectedElement('screen');
      setIsDragging(true);
      setDragStart({ x: point.x - screenPosition.x, y: point.y - screenPosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const point = getCanvasPoint(e);

    if (drawingState.isTexting) {
      canvas.style.cursor = 'text';
      return;
    }

    if (drawingState.isDrawing) {
      canvas.style.cursor = `url(${pencilCursor}) 0 24, crosshair`;
      continueDrawing(point);
      return;
    }

    if (drawingState.isErasing) {
      canvas.style.cursor = `url(${eraserCursor}) 8 24, cell`;
      continueDrawing(point);
      return;
    }

    if (!selectedElement) {
      canvas.style.cursor = 'default';
      return;
    }

    const currentPosition = selectedElement === 'camera' ? camPosition : screenPosition;
    const resizeHandle = getResizeHandle(point.x, point.y, currentPosition);

    canvas.style.cursor = resizeHandle
      ? getResizeCursor(resizeHandle)
      : isPointInElement(point.x, point.y, currentPosition)
        ? 'move'
        : 'default';
  };

  const handleMouseUp = () => {
    if (drawingState.isDrawing || drawingState.isErasing) {
      endDrawing();
      return;
    }

    setIsDragging(false);
    handleResizeEnd();
  };

  const drawPaths = (ctx: CanvasRenderingContext2D) => {
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
  };

  return (
    <div className="relative h-full w-full bg-black">
      <canvas ref={videoCanvasRef} className="absolute left-0 top-0 h-full w-full" />
      <canvas
        ref={canvasRef}
        className="absolute left-0 top-0 h-full w-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ background: 'transparent' }}
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
            onChange={handleTextInputChange}
            onKeyDown={handleTextInputKeyDown}
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
      <video ref={screenVideoRef} autoPlay playsInline className="hidden" />
      <video ref={mediaVideoRef} autoPlay playsInline className="hidden" />
    </div>
  );
}
