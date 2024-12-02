import { useState } from 'react';
import { NavLink } from 'react-router-dom';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label?: string;
  isExpanded: boolean;
}

export default function NavItem({ to, icon, label, isExpanded }: NavItemProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative flex h-12 items-center rounded-lg px-4 text-lico-gray-1 transition-colors hover:bg-lico-gray-3 hover:text-lico-orange-2 ${isActive ? 'text-lico-orange-2' : ''} `
      }
      onMouseEnter={() => !isExpanded && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex w-5 items-center">{icon}</div>
      <div
        className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'ml-4 w-32 opacity-100' : 'w-0 opacity-0'} `}
      >
        <span className="whitespace-nowrap font-bold text-base">{label}</span>
      </div>
      {!isExpanded && showTooltip && label && (
        <div className="absolute left-[calc(100%+8px)] z-50 whitespace-nowrap rounded bg-lico-gray-5 px-2 py-1 font-bold text-sm text-lico-orange-1">
          {label}
        </div>
      )}
    </NavLink>
  );
}
