import { NavLink } from 'react-router-dom';
import { LuMonitor, LuLayoutGrid, LuHeart, LuVideo, LuMenu } from 'react-icons/lu';
import useLayoutStore from '@store/useLayoutStore';

interface NavLinkProps {
  isActive: boolean;
}

export default function Navbar(): JSX.Element {
  const { toggleNavbar } = useLayoutStore();
  const linkClass = ({ isActive }: NavLinkProps): string =>
    `flex items-center rounded-lg px-4 py-3 transition-colors hover:bg-lico-gray-3 hover:text-lico-orange-2 ${
      isActive ? 'text-lico-orange-2' : ''
    }`;

  return (
    <nav className="fixed left-0 top-0 z-10 h-screen w-60 border-r border-lico-gray-3 bg-lico-gray-4">
      <div className="flex flex-col px-3 py-5">
        <div className="mb-4 flex">
          <button
            type="button"
            onClick={toggleNavbar}
            className="justify-centerfont-bold flex items-center px-4 pb-4 text-3xl text-lico-orange-2"
          >
            <LuMenu size={36} />
          </button>
          <NavLink to="/" className="font-bold text-3xl text-lico-orange-2">
            LICO
          </NavLink>
        </div>
        <div className="flex flex-col text-lico-gray-1">
          <NavLink to="/lives" className={linkClass}>
            <div className="flex items-center">
              <LuMonitor className="h-5 w-5" />
              <span className="ml-4 font-bold text-base">전체 방송</span>
            </div>
          </NavLink>
          <NavLink to="/category" className={linkClass}>
            <div className="flex items-center">
              <LuLayoutGrid className="h-5 w-5" />
              <span className="ml-4 font-bold text-base">카테고리</span>
            </div>
          </NavLink>
          <NavLink to="/following" className={linkClass}>
            <div className="flex items-center">
              <LuHeart className="h-5 w-5" />
              <span className="ml-4 font-bold text-base">팔로잉</span>
            </div>
          </NavLink>

          <div className="my-2 h-px bg-lico-gray-3" />

          <NavLink
            to="/studio"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center rounded-lg px-4 py-3 transition-colors hover:bg-lico-gray-3 hover:text-lico-orange-2"
          >
            <div className="flex items-center">
              <LuVideo className="h-5 w-5" />
              <span className="ml-4 font-bold text-base">스튜디오</span>
            </div>
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
