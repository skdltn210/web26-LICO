import React, { useState, useRef } from 'react';
import { LuSettings, LuCheck } from 'react-icons/lu';
import type { HLSQuality } from '@/types/hlsQuality';

interface SettingsControlProps {
  onShowControls: () => void;
  qualities: HLSQuality[];
  setQuality: (level: number) => void;
  currentQuality: number;
  iconSize: number;
}

const AUTO_LEVEL = -1;

export default function SettingsControl({
  onShowControls,
  qualities,
  setQuality,
  currentQuality,
  iconSize,
}: SettingsControlProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [currentSettingLevel, setCurrentSettingLevel] = useState<number | null>(AUTO_LEVEL);
  const settingsControlRef = useRef<HTMLDivElement>(null);

  const handleQualityChange = (level: number) => {
    setQuality(level);
    setCurrentSettingLevel(level);
    setShowSettings(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, level: number) => {
    if (event.key === 'Enter') {
      handleQualityChange(level);
    }
  };

  const getQualityLabel = (height: number) => {
    return `${height}p`;
  };

  const currentHeight = qualities.find(quality => quality.level === currentQuality)?.height;

  return (
    <div ref={settingsControlRef} className="relative flex items-center">
      <button
        type="button"
        onClick={() => {
          setShowSettings(!showSettings);
          onShowControls();
        }}
        className="hover:text-lico-orange-2"
        aria-label="화질 설정"
        aria-expanded={showSettings}
        aria-controls="settings-menu"
      >
        <LuSettings size={iconSize} />
      </button>
      {showSettings && (
        <div
          id="quality-menu"
          className="absolute bottom-8 right-0 min-w-[160px] rounded-md bg-lico-gray-4 py-2 text-sm text-lico-gray-2"
          role="menu"
        >
          <div
            className="flex cursor-pointer items-center px-2 py-2 hover:bg-lico-orange-1 hover:text-lico-gray-4"
            onClick={() => handleQualityChange(AUTO_LEVEL)}
            onKeyDown={event => handleKeyDown(event, AUTO_LEVEL)}
            role="menuitem"
            tabIndex={0}
          >
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <span className="font-medium">자동</span>
                {currentSettingLevel === AUTO_LEVEL && currentHeight && (
                  <span className="text-xs opacity-75">현재 {getQualityLabel(currentHeight)} 재생 중</span>
                )}
              </div>
            </div>
            {currentSettingLevel === AUTO_LEVEL && <LuCheck size={iconSize} className="ml-auto" />}
          </div>

          <div className="my-1 border-t border-lico-gray-3" />

          {[...qualities].reverse().map(quality => (
            <div
              key={quality.level}
              className="flex cursor-pointer items-center justify-between px-2 py-1 hover:bg-lico-orange-1 hover:text-lico-gray-4"
              onClick={() => handleQualityChange(quality.level)}
              onKeyDown={event => handleKeyDown(event, quality.level)}
              role="menuitem"
              tabIndex={0}
            >
              <span>{quality.height}p</span>
              {currentSettingLevel === quality.level && <LuCheck size={iconSize} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
