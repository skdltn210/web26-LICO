import React, { useState, useRef } from 'react';
import { LuSettings, LuCheck } from 'react-icons/lu';
import type { HLSQuality } from '@/types/hls';

interface SettingsControlProps {
  onShowControls: () => void;
  qualities: HLSQuality[];
  setQuality: (level: number) => void;
}

const AUTO_LEVEL = -1;

export default function SettingsControl({ onShowControls, qualities, setQuality }: SettingsControlProps) {
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

  return (
    <div ref={settingsControlRef} className="relative flex items-center">
      <button
        type="button"
        onClick={() => {
          setShowSettings(!showSettings);
          onShowControls();
        }}
        className="hover:text-lico-gray-2"
        aria-label="화질 설정"
        aria-expanded={showSettings}
        aria-controls="settings-menu"
      >
        <LuSettings size={18} />
      </button>
      {showSettings && (
        <div
          id="quality-menu"
          className="absolute bottom-8 right-0 min-w-[120px] rounded-md bg-lico-gray-4 py-2 text-sm text-lico-gray-2"
          role="menu"
        >
          <div
            className="flex cursor-pointer items-center justify-between px-2 py-1 hover:bg-lico-orange-1 hover:text-lico-gray-4"
            onClick={() => handleQualityChange(AUTO_LEVEL)}
            onKeyDown={event => handleKeyDown(event, AUTO_LEVEL)}
            role="menuitem"
            tabIndex={0}
          >
            <span>자동</span>
            {currentSettingLevel === AUTO_LEVEL && <LuCheck size={16} />}
          </div>

          {qualities.map(quality => (
            <div
              key={quality.level}
              className="flex cursor-pointer items-center justify-between px-2 py-1 hover:bg-lico-orange-1 hover:text-lico-gray-4"
              onClick={() => handleQualityChange(quality.level)}
              onKeyDown={event => handleKeyDown(event, quality.level)}
              role="menuitem"
              tabIndex={0}
            >
              <span>{quality.height}</span>
              {currentSettingLevel === quality.level && <LuCheck size={16} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
