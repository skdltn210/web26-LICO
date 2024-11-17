import { IconType } from 'react-icons';

interface ControlButtonProps {
  icon: IconType;
  label: string;
  isEnabled: boolean;
  onClick: () => void;
}

export default function ControlButton({ icon: Icon, label, isEnabled, onClick }: ControlButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 font-medium text-sm transition-colors ${
        isEnabled ? 'bg-lico-orange-2 text-lico-gray-5' : 'bg-lico-gray-3 text-lico-gray-1 hover:text-lico-orange-2'
      }`}
      aria-pressed={isEnabled}
      aria-label={label}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}
