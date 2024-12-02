import { forwardRef, useEffect, useRef } from 'react';
import { useStudioStore } from '@store/useStudioStore';

export const StreamCanvas = forwardRef<HTMLCanvasElement>((_, ref) => {
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const mediaVideoRef = useRef<HTMLVideoElement>(null);
  const animationFrameRef = useRef<number>();

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
      screenVideoRef.current.srcObject = screenStream;

      screenVideoRef.current.onloadedmetadata = () => {
        const video = screenVideoRef.current;
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
    }
  }, [screenStream, setScreenPosition]);

  useEffect(() => {
    if (mediaVideoRef.current && mediaStream) {
      mediaVideoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  useEffect(() => {
    const canvas = ref as React.MutableRefObject<HTMLCanvasElement>;
    const ctx = canvas.current?.getContext('2d', { alpha: false });
    const screenVideo = screenVideoRef.current;
    const mediaVideo = mediaVideoRef.current;

    if (!canvas.current || !ctx) return;

    ctx.imageSmoothingEnabled = false;

    const updateCanvas = () => {
      const container = canvas.current?.parentElement?.parentElement;
      if (!container) return;

      const scale = window.devicePixelRatio;
      canvas.current.width = container.clientWidth * scale;
      canvas.current.height = container.clientHeight * scale;
      canvas.current.style.width = `${container.clientWidth}px`;
      canvas.current.style.height = `${container.clientHeight}px`;

      ctx.scale(scale, scale);
      ctx.clearRect(0, 0, canvas.current.width / scale, canvas.current.height / scale);
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.current.width / scale, canvas.current.height / scale);

      if (screenVideo && screenStream) {
        ctx.drawImage(screenVideo, screenPosition.x, screenPosition.y, screenPosition.width, screenPosition.height);
      }

      if (mediaVideo && mediaStream && mediaStream.getVideoTracks().length > 0) {
        ctx.save();
        if (getIsCamFlipped()) {
          ctx.translate(camPosition.x + camPosition.width, camPosition.y);
          ctx.scale(-1, 1);
          ctx.drawImage(mediaVideo, 0, 0, camPosition.width, camPosition.height);
        } else {
          ctx.drawImage(mediaVideo, camPosition.x, camPosition.y, camPosition.width, camPosition.height);
        }
        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(updateCanvas);
    };

    animationFrameRef.current = requestAnimationFrame(updateCanvas);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [screenStream, mediaStream, camPosition, screenPosition, getIsCamFlipped, ref]);

  return (
    <>
      <canvas ref={ref} className="absolute left-0 top-0 z-0 h-full w-full" />
      <video ref={screenVideoRef} autoPlay playsInline className="hidden" />
      <video ref={mediaVideoRef} autoPlay playsInline className="hidden" />
    </>
  );
});

StreamCanvas.displayName = 'StreamCanvas';
