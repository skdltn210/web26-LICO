import { forwardRef, useEffect, useRef } from 'react';
import { Position } from '@/types/canvas';

interface StreamCanvasProps {
  screenStream: MediaStream | null;
  mediaStream: MediaStream | null;
  screenPosition: Position;
  camPosition: Position;
  getIsCamFlipped: () => boolean;
}

export const StreamCanvas = forwardRef<HTMLCanvasElement, StreamCanvasProps>(
  ({ screenStream, mediaStream, camPosition, getIsCamFlipped }, ref) => {
    const screenVideoRef = useRef<HTMLVideoElement>(null);
    const mediaVideoRef = useRef<HTMLVideoElement>(null);
    const animationFrameRef = useRef<number>();

    useEffect(() => {
      if (screenVideoRef.current && screenStream) {
        screenVideoRef.current.srcObject = screenStream;
      }
    }, [screenStream]);

    useEffect(() => {
      if (mediaVideoRef.current && mediaStream) {
        mediaVideoRef.current.srcObject = mediaStream;
      }
    }, [mediaStream]);

    useEffect(() => {
      const canvas = ref as React.RefObject<HTMLCanvasElement>;
      const ctx = canvas.current?.getContext('2d', { alpha: false });
      const screenVideo = screenVideoRef.current;
      const mediaVideo = mediaVideoRef.current;

      if (!canvas.current || !ctx) return;

      ctx.imageSmoothingEnabled = false;

      const updateCanvas = () => {
        const container = canvas.current!.parentElement;
        if (!container) return;

        const containerRect = container.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;

        canvas.current!.style.width = `${containerWidth}px`;
        canvas.current!.style.height = `${containerHeight}px`;

        const scale = window.devicePixelRatio;
        canvas.current!.width = Math.floor(containerWidth * scale);
        canvas.current!.height = Math.floor(containerHeight * scale);

        ctx.scale(scale, scale);

        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, containerWidth, containerHeight);

        if (screenVideo && screenStream && screenVideo.videoWidth > 0) {
          const videoRatio = screenVideo.videoWidth / screenVideo.videoHeight;
          let renderWidth = containerWidth;
          let renderHeight = containerWidth / videoRatio;

          if (renderHeight > containerHeight) {
            renderHeight = containerHeight;
            renderWidth = containerHeight * videoRatio;
          }

          const x = (containerWidth - renderWidth) / 2;
          const y = (containerHeight - renderHeight) / 2;

          ctx.drawImage(screenVideo, x, y, renderWidth, renderHeight);
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

      if (screenVideo) {
        screenVideo.onloadedmetadata = updateCanvas;
      }
      if (mediaVideo) {
        mediaVideo.onloadedmetadata = updateCanvas;
      }

      animationFrameRef.current = requestAnimationFrame(updateCanvas);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [ref, screenStream, mediaStream, camPosition, getIsCamFlipped]);

    return (
      <>
        <canvas ref={ref} className="absolute left-0 top-0 h-full w-full" />
        <video ref={screenVideoRef} autoPlay playsInline className="hidden" />
        <video ref={mediaVideoRef} autoPlay playsInline className="hidden" />
      </>
    );
  },
);

StreamCanvas.displayName = 'StreamCanvas';
