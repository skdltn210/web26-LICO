import { Link } from 'react-router-dom';
import { FaDisplay, FaTableCellsLarge, FaHeart, FaVideo } from 'react-icons/fa6';

export default function Navbar() {
  return (
    <nav className="fixed left-0 top-0 z-10 h-screen w-60 border-r border-lico-gray-3 bg-lico-gray-4">
      <div className="flex flex-col px-3 py-5">
        <div className="mb-4 pl-4">
          <Link to="/" className="font-bold text-3xl text-lico-orange-2">
            LICO
          </Link>
        </div>
        <div className="flex flex-col text-lico-gray-1">
          <Link
            to="/live"
            className="flex items-center rounded-lg px-4 py-3 transition-colors hover:bg-lico-gray-3 hover:text-lico-orange-2"
          >
            <div className="flex w-5 items-center justify-center">
              <FaDisplay className="h-5 w-5" />
            </div>
            <div className="ml-4 font-bold text-base">전체 방송</div>
          </Link>
          <Link
            to="/category"
            className="flex items-center rounded-lg px-4 py-3 transition-colors hover:bg-lico-gray-3 hover:text-lico-orange-2"
          >
            <div className="flex w-5 items-center justify-center">
              <FaTableCellsLarge className="h-5 w-5" />
            </div>
            <div className="ml-4 font-bold text-base">카테고리</div>
          </Link>
          <Link
            to="/following"
            className="flex items-center rounded-lg px-4 py-3 transition-colors hover:bg-lico-gray-3 hover:text-lico-orange-2"
          >
            <div className="flex w-5 items-center justify-center">
              <FaHeart className="h-5 w-5" />
            </div>
            <div className="ml-4 font-bold text-base">팔로잉</div>
          </Link>

          <div className="my-2 h-px bg-lico-gray-3"></div>

          <Link
            to="/studio"
            className="flex items-center rounded-lg px-4 py-3 transition-colors hover:bg-lico-gray-3 hover:text-lico-orange-2"
          >
            <div className="flex w-5 items-center justify-center">
              <FaVideo className="h-5 w-5" />
            </div>
            <div className="ml-4 font-bold text-base">스튜디오</div>
          </Link>
        </div>
      </div>
    </nav>
  );
}
