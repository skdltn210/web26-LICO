import { Outlet } from 'react-router-dom';
import Navbar from '@components/layout/Navbar';
import { useState } from 'react';

export default function Layout() {
  const [isExpanded, setIsExpanded] = useState(true);
  const handleNavbarToggle = () => setIsExpanded(!isExpanded);

  return (
    <div className="flex h-screen">
      <Navbar isExpanded={isExpanded} onToggle={handleNavbarToggle} />

      <main
        className={`${isExpanded ? 'ml-60' : 'ml-[76px]'} scrollbar-hider flex-1 overflow-auto bg-lico-gray-5 transition-all duration-300`}
      >
        <Outlet />
      </main>
    </div>
  );
}
