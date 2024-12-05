import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@components/layout/Navbar';
import useMediaQuery from '@hooks/useMediaQuery';
import useViewMode from '@store/useViewMode';

const NAVBAR_BREAKPOINT = '(min-width: 1000px)';

const NAV_WIDTH = {
  expanded: 'ml-60', // 240px
  collapsed: 'ml-[76px]', // 76px
  hidden: 'ml-0', // 0px
};

export default function Layout() {
  const [isNavbarExpanded, setIsNavbarExpanded] = useState<boolean>(true);
  const [isNavbarLocked, setIsNavbarLocked] = useState<boolean>(false);

  const isMediumScreen = useMediaQuery(NAVBAR_BREAKPOINT);
  const { isTheaterMode } = useViewMode();

  const handleNavbarToggle = () => {
    isNavbarExpanded ? setIsNavbarLocked(true) : setIsNavbarLocked(false);
    setIsNavbarExpanded(!isNavbarExpanded);
  };

  useEffect(() => {
    if (!isNavbarLocked) {
      setIsNavbarExpanded(isMediumScreen);
    }
  }, [isMediumScreen, isNavbarLocked]);

  const getMainMargin = () => {
    if (isTheaterMode) return NAV_WIDTH.hidden;
    return isNavbarExpanded ? NAV_WIDTH.expanded : NAV_WIDTH.collapsed;
  };

  return (
    <div className="flex h-screen">
      {!isTheaterMode && <Navbar isNavbarExpanded={isNavbarExpanded} onToggle={handleNavbarToggle} />}

      <main
        className={` ${getMainMargin()} scrollbar-hider flex-1 overflow-auto bg-lico-gray-5 transition-all duration-300`}
      >
        <Outlet />
      </main>
    </div>
  );
}
