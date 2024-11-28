interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

function Toggle({ checked, onChange, className = '' }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-14 items-center rounded-full transition-colors duration-200 ease-in-out ${checked ? 'bg-lico-orange-1' : 'bg-lico-gray-3'} ${className}`}
    >
      <div className="absolute inset-0 flex items-center justify-between px-1.5 font-medium text-xs">
        <span
          className={`font-bold text-lico-gray-3 transition-opacity duration-200 ${checked ? 'opacity-100' : 'opacity-0'}`}
        >
          ON
        </span>
        <span
          className={`font-bold text-lico-gray-1 transition-opacity duration-200 ${checked ? 'opacity-0' : 'opacity-100'}`}
        >
          OFF
        </span>
      </div>
      <div
        className={`${
          checked ? 'translate-x-8' : 'translate-x-1'
        } z-10 inline-block h-4 w-4 transform rounded-full bg-lico-gray-1 transition duration-300 ease-in-out`}
      />
    </button>
  );
}

export default Toggle;
