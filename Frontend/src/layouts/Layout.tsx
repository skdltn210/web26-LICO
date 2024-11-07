import { Outlet } from 'react-router-dom';
import Navbar from '@components/layout/Navbar';
import NavbarMini from '@components/layout/NavbarMini';
import useLayoutStore from '@store/useLayoutStore';

export default function Layout() {
  const { navbarState } = useLayoutStore();
  const isHidden = navbarState === 'hidden';
  const isCollapsed = navbarState === 'collapsed';

  return (
    <div className="flex h-screen">
      {isHidden ? '' : isCollapsed ? <NavbarMini /> : <Navbar />}
      <main
        className={`${!isHidden && 'ml-60'} ${isCollapsed && 'ml-[92px]'} flex-1 overflow-auto bg-lico-gray-5`}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
