import { useState, useRef } from 'react';
import { LuSettings } from 'react-icons/lu';

interface SettingsControlProps {
  onShowControls: () => void;
}

export default function SettingsControl({ onShowControls }: SettingsControlProps) {
  const [showSettings, setShowSettings] = useState(false);
  const settingsControlRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={settingsControlRef} className="relative flex items-center">
      <button
        type="button"
        onClick={() => {
          setShowSettings(!showSettings);
          onShowControls();
        }}
        className="hover:text-lico-gray-2"
        aria-label="설정"
        aria-expanded={showSettings}
        aria-controls="settings-menu"
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
  );
}
