import { forwardRef, useEffect, useRef, useCallback } from 'react';
import { useStudioStore } from '@store/useStudioStore';

export const StreamCanvas = forwardRef<HTMLCanvasElement>((_, ref) => {
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const mediaVideoRef = useRef<HTMLVideoElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animationFrameRef = useRef<number | null>();
  const lastDrawTimeRef = useRef<number>(0);

  const isBackgroundedRef = useRef<boolean>(false);

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
  const getAudioContext = useStudioStore(state => state.getAudioContext);

  const getIsCamFlipped = () => {
    if (!mediaStream) return false;
    return (mediaStream as any).isCamFlipped || false;
  };

  const updateCanvas = useCallback(
    (timestamp: number) => {
      if (Math.floor(timestamp / 1000) > Math.floor(lastDrawTimeRef.current / 1000)) {
      }

      if (timestamp - lastDrawTimeRef.current < 33.3) {
        if (!isBackgroundedRef.current) {
          animationFrameRef.current = requestAnimationFrame(updateCanvas);
        }
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

      if (!isBackgroundedRef.current) {
        animationFrameRef.current = requestAnimationFrame(updateCanvas);
      }
    },
    [screenStream, mediaStream, camPosition, screenPosition, ref],
  );

  const clearCurrentTimer = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const handleRenderingMode = useCallback(() => {
    clearCurrentTimer();

    const audioContext = getAudioContext();

    if (isBackgroundedRef.current && audioContext?.state === 'running') {
      const silence = audioContext.createGain();
      silence.gain.value = 0;
      silence.connect(audioContext.destination);

      let stopped = false;
      const createTimer = () => {
        if (stopped || !audioContext) return;
        const osc = audioContext.createOscillator();
        osc.onended = () => {
          if (!stopped) {
            updateCanvas(performance.now());
            createTimer();
          }
        };
        osc.connect(silence);
        osc.start(0);
        osc.stop(audioContext.currentTime + 1 / 30);
      };
      createTimer();

      return () => {
        stopped = true;
        silence.disconnect();
      };
    } else {
      animationFrameRef.current = requestAnimationFrame(updateCanvas);
    }
  }, [updateCanvas, clearCurrentTimer, getAudioContext]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      isBackgroundedRef.current = document.hidden;
      handleRenderingMode();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearCurrentTimer();
    };
  }, [handleRenderingMode, clearCurrentTimer]);

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
  }, [screenStream, screenPosition.width, setScreenPosition]);

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

  useEffect(() => {
    const canvas = (ref as React.MutableRefObject<HTMLCanvasElement>).current;
    if (canvas) {
      ctxRef.current = canvas.getContext('2d', { alpha: false });
      handleRenderingMode();
    }

    return () => {
      clearCurrentTimer();
    };
  }, [updateCanvas, handleRenderingMode, clearCurrentTimer]);

  return (
    <>
      <canvas ref={ref} className="absolute left-0 top-0 z-0 h-full w-full" />
      <video ref={screenVideoRef} autoPlay playsInline className="hidden" />
      <video ref={mediaVideoRef} autoPlay playsInline className="hidden" />
    </>
  );
});

StreamCanvas.displayName = 'StreamCanvas';
