import { Outlet } from 'react-router-dom';
import Navbar from '@components/layout/Navbar';

export default function Layout() {
  return (
    <>
      <Navbar />
      <main className="ml-56 p-12">
        <Outlet />
      </main>
    </>
  );
}
