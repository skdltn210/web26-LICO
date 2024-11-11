import { useState, useRef, useEffect } from 'react';
import useLayoutStore from '@store/useLayoutStore';
import useHls from '@hooks/useHls';
import LoadingSpinner from '@components/VideoPlayer/LoadingSpinner';
import Controls from './Control/index';

interface VideoPlayerProps {
  streamUrl: string;
}

export default function VideoPlayer({ streamUrl }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showCursor, setShowCursor] = useState(true);
  const { videoPlayerState, toggleVideoPlayer } = useLayoutStore();

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const { isBuffering, error } = useHls(streamUrl, videoRef);

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

  const handleVolumeChange = (newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
    setVolume(newVolume || 1);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      if (isMuted) {
        videoRef.current.volume = volume;
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
  };

  const startControlsTimer = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(hideAllControls, 3000);
  };

  const handleShowControls = () => {
    setShowControls(true);
    setShowCursor(true);
    startControlsTimer();
  };

  const handleMouseMove = () => {
    handleShowControls();
  };

  const handleMouseLeave = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    hideAllControls();
    setShowCursor(true);
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
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black text-white">
        <p>Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full ${!showCursor ? 'cursor-none' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <video ref={videoRef} className="h-full w-full bg-black" muted autoPlay playsInline>
        <track kind="captions" src="" />
      </video>
      {isBuffering && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )}

      <Controls
        isPlaying={isPlaying}
        isFullScreen={isFullScreen}
        videoPlayerState={videoPlayerState}
        showControls={showControls}
        volume={volume}
        isMuted={isMuted}
        onPlayToggle={togglePlay}
        onVolumeChange={handleVolumeChange}
        onMuteToggle={toggleMute}
        onFullScreenToggle={toggleFullScreen}
        onVideoPlayerToggle={toggleVideoPlayer}
        onShowControls={handleShowControls}
      />
    </div>
  );
}
