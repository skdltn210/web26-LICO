import { useRef } from 'react';
import useHls from '@hooks/useHls.ts';
import { config } from '@config/env.ts';

interface HoverPreviewPlayerProps {
  channelId: string;
}

export default function HoverPreviewPlayer({ channelId }: HoverPreviewPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamUrl = `${config.storageUrl}/${channelId}/index.m3u8`;

  useHls(streamUrl, videoRef, {
    startLevel: 0,
  });

  return <video ref={videoRef} className="h-full w-full bg-black" muted autoPlay playsInline />;
}
