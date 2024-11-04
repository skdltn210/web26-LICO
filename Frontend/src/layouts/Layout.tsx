import { Outlet } from 'react-router-dom';
import Navbar from '@components/layout/Navbar';

export default function Layout() {
  return (
    <div className="flex h-screen">
      <Navbar />
      <main className="ml-60 flex-1 overflow-auto bg-lico-gray-5 p-12">
        <Outlet />
      </main>
    </div>
  );
}
