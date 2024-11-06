import { NavLink } from 'react-router-dom';
import { LuMonitor, LuLayoutGrid, LuHeart, LuVideo } from 'react-icons/lu';

interface NavLinkProps {
  isActive: boolean;
}

export default function Navbar(): JSX.Element {
  const linkClass = ({ isActive }: NavLinkProps): string =>
    `flex items-center rounded-lg px-4 py-3 transition-colors hover:bg-lico-gray-3 hover:text-lico-orange-2 ${
      isActive ? 'text-lico-orange-2' : ''
    }`;

  return (
    <nav className="fixed left-0 top-0 z-10 h-screen w-60 border-r border-lico-gray-3 bg-lico-gray-4">
      <div className="flex flex-col px-3 py-5">
        <div className="mb-4 pl-4">
          <NavLink to="/" className="font-bold text-3xl text-lico-orange-2">
            LICO
          </NavLink>
        </div>
        <div className="flex flex-col text-lico-gray-1">
          <NavLink to="/lives" className={linkClass}>
            <div className="flex items-center">
              <LuMonitor className="-mt-0.5 h-5 w-5" />
              <span className="ml-4 font-bold text-base">전체 방송</span>
            </div>
          </NavLink>
          <NavLink to="/category" className={linkClass}>
            <div className="flex items-center">
              <LuLayoutGrid className="-mt-0.5 h-5 w-5" />
              <span className="ml-4 font-bold text-base">카테고리</span>
            </div>
          </NavLink>
          <NavLink to="/following" className={linkClass}>
            <div className="flex items-center">
              <LuHeart className="-mt-0.5 h-5 w-5" />
              <span className="ml-4 font-bold text-base">팔로잉</span>
            </div>
          </NavLink>

          <div className="my-2 h-px bg-lico-gray-3"></div>

          <a
            href="/studio"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center rounded-lg px-4 py-3 transition-colors hover:bg-lico-gray-3 hover:text-lico-orange-2"
          >
            <div className="flex items-center">
              <LuVideo className="-mt-0.5 h-5 w-5" />
              <span className="ml-4 font-bold text-base">스튜디오</span>
            </div>
          </a>
        </div>
      </div>
    </nav>
  );
}
