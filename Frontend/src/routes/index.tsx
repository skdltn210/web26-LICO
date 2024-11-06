import { Routes, Route } from 'react-router-dom';
import Layout from '@layouts/Layout';
import HomePage from '@pages/HomePage';
import FollowingPage from '@pages/FollowingPage';
import CategoryPage from '@pages/CategoryPage';
import CategoryDetailPage from '@pages/CategoryPage/CategoryDetailPage';
import LivePage from '@pages/LivePage';
import LivesPage from '@pages/LivesPage';
import StudioPage from '@pages/StudioPage';

const routes = [
  { path: '/', element: <HomePage /> },
  { path: '/following', element: <FollowingPage /> },
  { path: '/category', element: <CategoryPage /> },
  { path: '/category/:categoryId', element: <CategoryDetailPage /> },
  { path: '/live/:id', element: <LivePage /> },
  { path: '/lives', element: <LivesPage /> },
  { path: '/studio', element: <StudioPage /> },
];

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {routes.map(route => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>
    </Routes>
  );
}
