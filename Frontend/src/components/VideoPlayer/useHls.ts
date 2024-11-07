import { useEffect } from 'react';
import Hls from 'hls.js';

interface HlsOptions {
  debug?: boolean;
  enableWorker?: boolean;
  lowLatencyMode?: boolean;
  onError?: (error: Error) => void;
}

export const useHls = (
  streamUrl: string | undefined,
  videoRef: React.RefObject<HTMLVideoElement>,
  options: HlsOptions = {},
) => {
  useEffect(() => {
    let hls: Hls | null = null;

    const initHls = () => {
      if (!videoRef.current || !streamUrl) return;

      if (Hls.isSupported()) {
        hls = new Hls({
          debug: options.debug ?? false,
          enableWorker: options.enableWorker ?? true,
          lowLatencyMode: options.lowLatencyMode ?? true,
        });

        hls.loadSource(streamUrl);
        hls.attachMedia(videoRef.current);

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls?.startLoad();
                options.onError?.(new Error('Network error occurred'));
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls?.recoverMediaError();
                options.onError?.(new Error('Media error occurred'));
                break;
              default:
                hls?.destroy();
                options.onError?.(new Error('Fatal error occurred'));
                break;
            }
          }
        });
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = streamUrl;
      } else {
        options.onError?.(new Error('HLS is not supported in this browser'));
      }
    };

    initHls();

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [streamUrl, options.debug, options.enableWorker, options.lowLatencyMode]);
};
