import { useRef, useEffect } from 'react';
import { config } from '@config/env.ts';
import { HLSController } from '../../../../lib/controller/HLSController';

interface HoverPreviewPlayerProps {
  channelId: string;
}

export default function HoverPreviewPlayer({ channelId }: HoverPreviewPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HLSController | null>(null);
  const streamUrl = `${config.storageUrl}/${channelId}/index.m3u8`;

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    playerRef.current = new HLSController({
      videoElement,
      liveRefreshInterval: 3000,
    });

    const initStream = async () => {
      try {
        await playerRef.current?.loadStream(streamUrl);
      } catch (error) {
        console.error('Failed to initialize stream:', error);
      }
    };

    initStream();

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [streamUrl, channelId]);

  return <video ref={videoRef} className="h-full w-full bg-black" muted autoPlay playsInline />;
}
