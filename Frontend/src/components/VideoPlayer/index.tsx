import { useState, useRef, useEffect } from 'react';
import { LuPlay, LuPause, LuVolumeX, LuVolume2, LuSettings, LuMinimize, LuMaximize, LuTv2 } from 'react-icons/lu';
import useLayoutStore from '@store/useLayoutStore';

interface VideoPlayerProps {
  streamUrl: string;
}

export default function VideoPlayer({ streamUrl }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isVolumeHovered, setIsVolumeHovered] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showCursor, setShowCursor] = useState(true);
  const { toggleVideoPlayer } = useLayoutStore();

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const volumeControlRef = useRef<HTMLDivElement>(null);
  const settingsControlRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value) / 10;
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume || 1;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullScreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const hideAllControls = () => {
    setShowControls(false);
    setShowCursor(false);
    setShowSettings(false);
    setShowVolumeSlider(false);
  };

  const startControlsTimer = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(hideAllControls, 3000);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    setShowCursor(true);
    startControlsTimer();
  };

  const handleMouseLeave = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    hideAllControls();
    setShowCursor(true);
    setIsVolumeHovered(false);
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (volumeControlRef.current && !volumeControlRef.current.contains(event.target as Node) && !isVolumeHovered) {
        setShowVolumeSlider(false);
      }

      if (settingsControlRef.current && !settingsControlRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isVolumeHovered]);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full ${!showCursor ? 'cursor-none' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <video ref={videoRef} className="h-full w-full bg-black" autoPlay playsInline>
        <source src={streamUrl} type="application/x-mpegURL" />
        브라우저가 비디오 재생을 지원하지 않습니다.
      </video>

      <div
        className={`absolute bottom-0 left-0 right-0 p-4 text-lico-gray-1 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        <div className="flex items-center gap-4">
          <button onClick={togglePlay} className="hover:text-lico-gray-2">
            {isPlaying ? <LuPause size={18} /> : <LuPlay size={18} />}
          </button>

          <div
            ref={volumeControlRef}
            className="relative flex items-center gap-2"
            onMouseEnter={() => {
              setShowVolumeSlider(true);
              setIsVolumeHovered(true);
              setShowControls(true);
              setShowCursor(true);
              startControlsTimer();
            }}
            onMouseLeave={() => {
              setIsVolumeHovered(false);
            }}
          >
            <button onClick={toggleMute} className="hover:text-lico-gray-2">
              {isMuted ? <LuVolumeX size={18} /> : <LuVolume2 size={18} />}
            </button>
            <div
              className={`absolute bottom-[1px] left-6 transition-opacity duration-200 ${
                showVolumeSlider ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
            >
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={isMuted ? 0 : volume * 10}
                onChange={handleVolume}
                className="h-1 w-32 cursor-pointer appearance-none bg-transparent"
                style={{
                  background: `linear-gradient(to right, #FF6B34 0%, #FF6B34 ${
                    (isMuted ? 0 : volume) * 100
                  }%, #B0B0B0 ${(isMuted ? 0 : volume) * 100}%, #B0B0B0 100%)`,
                  outline: 'none',
                  borderRadius: '4px',
                }}
              />
            </div>
          </div>

          <div className="relative ml-auto flex items-center gap-4">
            <div ref={settingsControlRef} className="relative flex items-center">
              <button
                onClick={() => {
                  setShowSettings(!showSettings);
                  setShowControls(true);
                  setShowCursor(true);
                  startControlsTimer();
                }}
                className="hover:text-lico-gray-2"
              >
                <LuSettings size={18} />
              </button>
              {showSettings && (
                <div className="absolute bottom-5 right-0 rounded bg-black/50 font-medium text-sm text-lico-gray-2">
                  <p className="hover:text-lico-gray-1">auto</p>
                  <p className="hover:text-lico-gray-1">1080p</p>
                  <p className="hover:text-lico-gray-1">720p</p>
                  <p className="hover:text-lico-gray-1">480p</p>
                  <p className="hover:text-lico-gray-1">360p</p>
                </div>
              )}
            </div>

            <button onClick={toggleVideoPlayer} className="hover:text-lico-gray-2">
              <LuTv2 size={18} />
            </button>

            <button onClick={toggleFullScreen} className="hover:text-lico-gray-2">
              {isFullScreen ? <LuMinimize size={18} /> : <LuMaximize size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
