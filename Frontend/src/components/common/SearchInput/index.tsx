import { KeyboardEvent } from 'react';
import { LuSearch } from 'react-icons/lu';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onClick?: () => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput = ({
  value,
  onChange,
  onFocus,
  onClick,
  onKeyDown,
  placeholder,
  className,
}: SearchInputProps) => {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <LuSearch className="h-4 w-4 text-lico-gray-2" aria-hidden="true" />
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onClick={onClick}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        className={`w-full rounded bg-lico-gray-5 py-2 pl-9 pr-2 font-medium text-sm text-lico-gray-1 outline-none focus:ring-2 focus:ring-lico-orange-2 ${className}`}
        placeholder={placeholder}
        autoComplete="off"
      />
    </div>
  );
};
