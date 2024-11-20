import React, { useState, useRef } from 'react';
import { LuVolumeX, LuVolume2 } from 'react-icons/lu';

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onShowControls: () => void;
  iconSize: number;
}

export default function VolumeControl({
  volume,
  isMuted,
  onVolumeChange,
  onMuteToggle,
  onShowControls,
  iconSize,
}: VolumeControlProps) {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const volumeControlRef = useRef<HTMLDivElement>(null);

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value) / 10;
    onVolumeChange(newVolume);
  };

  return (
    <div
      ref={volumeControlRef}
      className="relative flex items-center gap-2"
      onMouseEnter={() => {
        setShowVolumeSlider(true);
        onShowControls();
      }}
    >
      <button
        type="button"
        onClick={onMuteToggle}
        className="hover:text-lico-orange-1"
        aria-label={isMuted ? '음소거 해제' : '음소거'}
        aria-pressed={isMuted}
      >
        {isMuted ? <LuVolumeX size={iconSize} /> : <LuVolume2 size={iconSize} />}
      </button>
      <div
        className={`absolute bottom-1 left-7 transition-opacity duration-200 ${
          showVolumeSlider ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        role="group"
        aria-label="볼륨 조절"
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
          aria-label="볼륨"
          aria-valuemin={0}
          aria-valuemax={10}
          aria-valuenow={isMuted ? 0 : volume * 10}
          aria-valuetext={`볼륨 ${Math.round(isMuted ? 0 : volume * 100)}%`}
        />
      </div>
    </div>
  );
}
