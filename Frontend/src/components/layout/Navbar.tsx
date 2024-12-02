import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LuMonitor, LuLayoutGrid, LuHeart, LuVideo, LuMenu, LuLogIn, LuLogOut, LuUser } from 'react-icons/lu';
import { useAuthStore } from '@store/useAuthStore';
import { useAuth } from '@hooks/useAuth';
import NavItem from '@components/layout/NavItem';

interface NavbarProps {
  isNavbarExpanded: boolean;
  onToggle: () => void;
}

export default function Navbar({ isNavbarExpanded, onToggle }: NavbarProps) {
  const [showLogoutTooltip, setShowLogoutTooltip] = useState(false);
  const user = useAuthStore(state => state.user);
  const { logout } = useAuth();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
  };

  return (
    <nav
      className={`fixed left-0 top-0 z-10 h-screen border-r border-lico-gray-3 bg-lico-gray-4 transition-all duration-300 ${
        isNavbarExpanded ? 'w-60' : 'w-[76px]'
      }`}
    >
      <div className="flex h-full flex-col px-3 py-5">
        <div className="mb-4 flex items-center">
          <button
            type="button"
            onClick={onToggle}
            className="flex h-12 w-12 items-center justify-center text-3xl text-lico-orange-2"
          >
            <LuMenu size={36} />
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ${isNavbarExpanded ? 'w-32 opacity-100' : 'w-0 opacity-0'} `}
          >
            <NavLink to="/" className="ml-1 whitespace-nowrap font-bold text-3xl text-lico-orange-2">
              LICO
            </NavLink>
          </div>
        </div>

        <div className="flex flex-col">
          <NavItem
            to="/lives"
            icon={<LuMonitor className="h-5 w-5" />}
            label="전체 방송"
            isExpanded={isNavbarExpanded}
          />
          <NavItem
            to="/category"
            icon={<LuLayoutGrid className="h-5 w-5" />}
            label="카테고리"
            isExpanded={isNavbarExpanded}
          />
          <NavItem
            to="/following"
            icon={<LuHeart className="h-5 w-5" />}
            label="팔로잉"
            isExpanded={isNavbarExpanded}
          />

          <div className="my-2 h-px bg-lico-gray-3" />

          <NavItem
            to={`/studio/${user?.channelId}`}
            icon={<LuVideo className="h-5 w-5" />}
            label="스튜디오"
            isExpanded={isNavbarExpanded}
          />
        </div>

        <div className="flex-grow" />

        {user ? (
          <>
            <NavItem
              to={`/mypage/${user.id}`}
              icon={<LuUser className="h-5 w-5" />}
              label="마이페이지"
              isExpanded={isNavbarExpanded}
            />
            <button
              type="button"
              onClick={handleLogout}
              onMouseEnter={() => !isNavbarExpanded && setShowLogoutTooltip(true)}
              onMouseLeave={() => setShowLogoutTooltip(false)}
              className="relative flex h-12 items-center rounded-lg px-4 text-left text-lico-gray-1 hover:bg-lico-gray-3 hover:text-lico-orange-2"
            >
              <div className="flex w-5 items-center">
                <LuLogOut className="h-5 w-5" />
              </div>
              <div
                className={`overflow-hidden transition-all duration-300 ${isNavbarExpanded ? 'ml-4 w-32 opacity-100' : 'w-0 opacity-0'} `}
              >
                <span className="whitespace-nowrap font-bold text-base">로그아웃</span>
              </div>
              {!isNavbarExpanded && showLogoutTooltip && (
                <div className="absolute left-[calc(100%+8px)] z-50 whitespace-nowrap rounded bg-lico-gray-5 px-2 py-1 font-bold text-sm text-lico-orange-1">
                  로그아웃
                </div>
              )}
            </button>
          </>
        ) : (
          <NavItem to="/login" icon={<LuLogIn className="h-5 w-5" />} label="로그인" isExpanded={isNavbarExpanded} />
        )}
      </div>
    </nav>
  );
}
