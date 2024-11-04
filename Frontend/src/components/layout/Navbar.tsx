import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="fixed left-0 top-0 z-10 h-screen w-60 bg-lico-gray-4">
      <div className="flex flex-col px-3 py-5">
        <div className="mb-4 pl-4">
          <Link to="/" className="font-bold text-3xl text-lico-orange-2">
            LICO
          </Link>
        </div>
      </div>
    </nav>
  );
}
