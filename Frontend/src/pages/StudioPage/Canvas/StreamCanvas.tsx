import { forwardRef, useEffect, useRef, useCallback } from 'react';
import { useStudioStore } from '@store/useStudioStore';

export const StreamCanvas = forwardRef<HTMLCanvasElement>((_, ref) => {
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const mediaVideoRef = useRef<HTMLVideoElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animationFrameRef = useRef<number>();
  const lastDrawTimeRef = useRef<number>(0);

  const streamStatusRef = useRef({
    isScreenConnected: false,
    isMediaConnected: false,
    hasError: false,
  });

  const screenStream = useStudioStore(state => state.screenStream);
  const mediaStream = useStudioStore(state => state.mediaStream);
  const screenPosition = useStudioStore(state => state.screenPosition);
  const camPosition = useStudioStore(state => state.camPosition);
  const setScreenPosition = useStudioStore(state => state.setScreenPosition);

  const getIsCamFlipped = () => {
    if (!mediaStream) return false;
    return (mediaStream as any).isCamFlipped || false;
  };

  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      const video = screenVideoRef.current;

      try {
        if (video.srcObject !== screenStream) {
          video.srcObject = screenStream;
        }

        video.onloadedmetadata = () => {
          if (video) {
            const videoAspectRatio = video.videoWidth / video.videoHeight;
            const container = (ref as React.MutableRefObject<HTMLCanvasElement>).current?.parentElement?.parentElement;

            if (container) {
              let newWidth = screenPosition.width;
              let newHeight = newWidth / videoAspectRatio;

              if (newHeight > container.clientHeight) {
                newHeight = container.clientHeight;
                newWidth = newHeight * videoAspectRatio;
              }

              const newX = (container.clientWidth - newWidth) / 2;
              const newY = (container.clientHeight - newHeight) / 2;

              setScreenPosition({
                x: newX,
                y: newY,
                width: newWidth,
                height: newHeight,
              });
            }
          }
        };

        streamStatusRef.current.isScreenConnected = true;
      } catch (error) {
        console.error('Screen stream connection failed:', error);
        streamStatusRef.current.hasError = true;
      }
    }

    return () => {
      if (screenVideoRef.current && screenVideoRef.current.srcObject !== screenStream) {
        screenVideoRef.current.srcObject = null;
        streamStatusRef.current.isScreenConnected = false;
      }
    };
  }, [screenStream, setScreenPosition]);

  useEffect(() => {
    if (mediaVideoRef.current && mediaStream) {
      const video = mediaVideoRef.current;

      try {
        video.srcObject = mediaStream;
        streamStatusRef.current.isMediaConnected = true;
      } catch (error) {
        console.error('Media stream connection failed:', error);
        streamStatusRef.current.hasError = true;
      }
    }

    return () => {
      if (mediaVideoRef.current) {
        mediaVideoRef.current.srcObject = null;
        streamStatusRef.current.isMediaConnected = false;
      }
    };
  }, [mediaStream]);

  const updateCanvas = useCallback(
    (timestamp: number) => {
      if (timestamp - lastDrawTimeRef.current < 33.3) {
        animationFrameRef.current = requestAnimationFrame(updateCanvas);
        return;
      }

      const canvas = (ref as React.MutableRefObject<HTMLCanvasElement>).current;
      const ctx = ctxRef.current;
      if (!canvas || !ctx) return;

      const container = canvas.parentElement?.parentElement;
      if (!container) return;

      const scale = window.devicePixelRatio;
      const needsResize =
        canvas.width !== container.clientWidth * scale || canvas.height !== container.clientHeight * scale;

      if (needsResize) {
        canvas.width = container.clientWidth * scale;
        canvas.height = container.clientHeight * scale;
        canvas.style.width = `${container.clientWidth}px`;
        canvas.style.height = `${container.clientHeight}px`;
        ctx.scale(scale, scale);
        ctx.imageSmoothingEnabled = false;
      }

      ctx.clearRect(0, 0, canvas.width / scale, canvas.height / scale);
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width / scale, canvas.height / scale);

      if (screenVideoRef.current && screenStream && streamStatusRef.current.isScreenConnected) {
        ctx.drawImage(
          screenVideoRef.current,
          screenPosition.x,
          screenPosition.y,
          screenPosition.width,
          screenPosition.height,
        );
      }

      if (
        mediaVideoRef.current &&
        mediaStream &&
        streamStatusRef.current.isMediaConnected &&
        mediaStream.getVideoTracks().length > 0
      ) {
        ctx.save();
        if (getIsCamFlipped()) {
          ctx.translate(camPosition.x + camPosition.width, camPosition.y);
          ctx.scale(-1, 1);
          ctx.drawImage(mediaVideoRef.current, 0, 0, camPosition.width, camPosition.height);
        } else {
          ctx.drawImage(mediaVideoRef.current, camPosition.x, camPosition.y, camPosition.width, camPosition.height);
        }
        ctx.restore();
      }

      lastDrawTimeRef.current = timestamp;
      animationFrameRef.current = requestAnimationFrame(updateCanvas);
    },
    [screenStream, mediaStream, camPosition, screenPosition, ref],
  );

  useEffect(() => {
    const canvas = (ref as React.MutableRefObject<HTMLCanvasElement>).current;
    if (canvas) {
      ctxRef.current = canvas.getContext('2d', { alpha: false });
      animationFrameRef.current = requestAnimationFrame(updateCanvas);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [updateCanvas]);

  return (
    <>
      <canvas ref={ref} className="absolute left-0 top-0 z-0 h-full w-full" />
      <video ref={screenVideoRef} autoPlay playsInline className="hidden" />
      <video ref={mediaVideoRef} autoPlay playsInline className="hidden" />
    </>
  );
});

StreamCanvas.displayName = 'StreamCanvas';
