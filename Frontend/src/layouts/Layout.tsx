import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@components/layout/Navbar';
import useMediaQuery from '@hooks/useMediaQuery';

export default function Layout() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const isMedium = useMediaQuery('(min-width: 700px)');

  const handleNavbarToggle = () => {
    if (!isExpanded) {
      setIsLocked(false);
    } else {
      setIsLocked(true);
    }
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    if (!isLocked) {
      setIsExpanded(isMedium);
    }
  }, [isMedium, isLocked]);

  return (
    <div className="flex h-screen">
      <Navbar isExpanded={isExpanded} onToggle={handleNavbarToggle} />

      <main
        className={`${isExpanded ? 'ml-60' : 'ml-[76px]'} scrollbar-hider min-w-[700px] flex-1 overflow-auto bg-lico-gray-5 transition-all duration-300`}
      >
        <Outlet />
      </main>
    </div>
  );
}
