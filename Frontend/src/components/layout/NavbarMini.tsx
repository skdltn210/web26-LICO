import { NavLink } from 'react-router-dom';
import { LuMonitor, LuLayoutGrid, LuHeart, LuVideo, LuMenu } from 'react-icons/lu';
import useLayoutStore from '@store/useLayoutStore.ts';

interface NavLinkProps {
  isActive: boolean;
}

export default function NavbarMini(): JSX.Element {
  const { toggleNavbar } = useLayoutStore();

  const linkClass = ({ isActive }: NavLinkProps): string =>
    `flex justify-center items-center rounded-lg px-4 py-3 transition-colors hover:bg-lico-gray-3 hover:text-lico-orange-2 ${
      isActive ? 'text-lico-orange-2' : ''
    }`;

  return (
    <nav className="fixed left-0 top-0 z-10 h-screen border-r border-lico-gray-3 bg-lico-gray-4">
      <div className="flex flex-col px-3 py-5">
        <button
          type="button"
          onClick={toggleNavbar}
          className="justify-centerfont-bold flex items-center px-4 pb-4 text-3xl text-lico-orange-2"
        >
          <LuMenu size={36} />
        </button>
        <div className="flex flex-col text-lico-gray-1">
          <NavLink to="/lives" className={linkClass}>
            <div className="flex items-center">
              <LuMonitor className="-mt-0.5 h-5 w-5" />
            </div>
          </NavLink>
          <NavLink to="/category" className={linkClass}>
            <div className="flex items-center">
              <LuLayoutGrid className="-mt-0.5 h-5 w-5" />
            </div>
          </NavLink>
          <NavLink to="/following" className={linkClass}>
            <div className="flex items-center">
              <LuHeart className="-mt-0.5 h-5 w-5" />
            </div>
          </NavLink>

          <div className="my-2 h-px bg-lico-gray-3" />

          <NavLink to="/studio" className={linkClass}>
            <div className="flex items-center">
              <LuVideo className="-mt-0.5 h-5 w-5" />
            </div>
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
