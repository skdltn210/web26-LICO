import { LuPlay, LuPause, LuMinimize, LuMaximize, LuTv2 } from 'react-icons/lu';
import VolumeControl from './VolumeControl';
import SettingsControl from './SettingsControl';
import type { HLSQuality } from '@/types/hlsQuality';

interface ControlsProps {
  isPlaying: boolean;
  isFullScreen: boolean;
  isTheaterMode: boolean;
  showControls: boolean;
  volume: number;
  isMuted: boolean;
  onPlayToggle: () => void;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onFullScreenToggle: () => void;
  onVideoPlayerToggle: () => void;
  onShowControls: () => void;
  qualities: HLSQuality[];
  setQuality: (level: number) => void;
  currentQuality: number;
}

const CONTROL_ICON_SIZE = 24;

export default function Controls({
  isPlaying,
  isFullScreen,
  isTheaterMode,
  showControls,
  volume,
  isMuted,
  onPlayToggle,
  onVolumeChange,
  onMuteToggle,
  onFullScreenToggle,
  onVideoPlayerToggle,
  onShowControls,
  qualities,
  setQuality,
  currentQuality,
}: ControlsProps) {
  return (
    <div
      className={`absolute bottom-0 left-0 right-0 p-4 text-lico-orange-1 transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      role="toolbar"
      aria-label="비디오 컨트롤"
    >
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onPlayToggle}
          className="hover:text-lico-orange-2"
          aria-label={isPlaying ? '일시정지' : '재생'}
          aria-pressed={isPlaying}
        >
          {isPlaying ? <LuPause size={CONTROL_ICON_SIZE} /> : <LuPlay size={CONTROL_ICON_SIZE} />}
        </button>

        <VolumeControl
          volume={volume}
          isMuted={isMuted}
          onVolumeChange={onVolumeChange}
          onMuteToggle={onMuteToggle}
          onShowControls={onShowControls}
          iconSize={CONTROL_ICON_SIZE}
        />

        <div className="relative ml-auto flex items-center gap-4">
          <SettingsControl
            onShowControls={onShowControls}
            qualities={qualities}
            setQuality={setQuality}
            currentQuality={currentQuality}
            iconSize={CONTROL_ICON_SIZE}
          />

          <button
            type="button"
            onClick={onVideoPlayerToggle}
            className="hover:text-lico-orange-2"
            aria-label={isFullScreen ? '극장모드 종료' : '극장모드'}
            aria-pressed={isFullScreen}
          >
            <LuTv2 size={CONTROL_ICON_SIZE} />
          </button>

          <button
            type="button"
            onClick={onFullScreenToggle}
            className="hover:text-lico-orange-2"
            aria-label={isTheaterMode ? '전체화면 종료' : '전체화면'}
            aria-pressed={isTheaterMode}
          >
            {isFullScreen ? <LuMinimize size={CONTROL_ICON_SIZE} /> : <LuMaximize size={CONTROL_ICON_SIZE} />}
          </button>
        </div>
      </div>
    </div>
  );
}
