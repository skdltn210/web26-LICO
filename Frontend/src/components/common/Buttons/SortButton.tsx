import { IconType } from 'react-icons';

interface SortButtonProps {
  label: string;
  icon?: IconType;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

function SortButton({ label, icon: Icon, isActive = false, onClick, className = '' }: SortButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 font-bold text-sm transition-colors duration-150 ${
        isActive
          ? 'bg-lico-orange-2 text-lico-gray-1 hover:bg-lico-orange-1'
          : 'bg-lico-gray-3 text-lico-gray-1 hover:bg-lico-orange-1'
      } ${className} `}
    >
      <span className="mr-1.5">{Icon && <Icon size={16} className="-mt-0.5" />}</span>
      {label}
    </button>
  );
}

export default SortButton;
