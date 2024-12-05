import React, { useEffect, useState } from 'react';
import Hls, { LevelSwitchedData } from 'hls.js';
import type { HLSQuality } from '@/types/hlsQuality';

interface HlsOptions {
  startLevel?: number;
}

const useHls = (
  streamUrl: string | undefined,
  videoRef: React.RefObject<HTMLVideoElement>,
  options: HlsOptions = {},
) => {
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentQuality, setCurrentQuality] = useState<number>(-1);
  const [qualities, setQualities] = useState<HLSQuality[]>([]);
  const [hls, setHls] = useState<Hls | null>(null);

  useEffect(() => {
    let hlsInstance: Hls | null = null;
    const videoElement = videoRef.current;

    const handleBuffering = (buffering: boolean) => {
      setIsBuffering(buffering);
    };

    const setupVideoListeners = () => {
      if (!videoElement) return;

      videoElement.addEventListener('waiting', () => handleBuffering(true));
      videoElement.addEventListener('playing', () => handleBuffering(false));
    };

    const removeVideoListeners = () => {
      if (!videoElement) return;

      videoElement.removeEventListener('waiting', () => handleBuffering(true));
      videoElement.removeEventListener('playing', () => handleBuffering(false));
    };

    const initHls = () => {
      if (!videoElement || !streamUrl) return;

      setError(null);

      if (Hls.isSupported()) {
        hlsInstance = new Hls({
          startLevel: options.startLevel ?? -1,
          backBufferLength: 0,
          liveSyncDurationCount: 1,
          liveDurationInfinity: true,
          maxBufferHole: 1,
        });
        setHls(hlsInstance);

        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(videoElement);

        hlsInstance.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
          const availableQualities = data.levels.map((level, index) => ({
            level: index,
            height: level.height,
            width: level.width,
            bitrate: level.bitrate,
          }));
          setQualities(availableQualities);
        });

        hlsInstance.on(Hls.Events.LEVEL_SWITCHED, (_, data: LevelSwitchedData) => {
          setCurrentQuality(data.level);
        });

        hlsInstance.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                if (data.response?.code === 404) {
                  setError(new Error('Stream not found (404)'));
                  hlsInstance?.destroy();
                  return;
                }

                hlsInstance?.startLoad();
                setError(new Error('Network error occurred'));
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hlsInstance?.recoverMediaError();
                setError(new Error('Media error occurred'));
                break;
              default:
                hlsInstance?.destroy();
                setError(new Error('Fatal error occurred'));
                break;
            }
          }
        });

        setupVideoListeners();
      } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        videoElement.src = streamUrl;
        setupVideoListeners();
      } else {
        setError(new Error('HLS is not supported in this browser'));
      }
    };

    initHls();

    return () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
      removeVideoListeners();
    };
  }, [options.startLevel, streamUrl, videoRef]);

  const setQuality = (level: number) => {
    if (hls) {
      hls.currentLevel = level;
    }
  };

  const stopStream = () => {
    if (hls) {
      hls.stopLoad();
    }
  };

  const startStream = () => {
    if (hls) {
      hls.startLoad();
    }
  };

  const playFromLiveEdge = () => {
    if (hls) {
      hls.startLoad(-1); // 최신 LiveEdge로 이동
      return;
    }
    const videoElement = videoRef.current;
    if (!videoElement) return;
    videoElement.currentTime = videoElement.duration;
  };

  return {
    isBuffering,
    error,
    qualities,
    currentQuality,
    setQuality,
    stopStream,
    startStream,
    playFromLiveEdge,
  };
};

export default useHls;
