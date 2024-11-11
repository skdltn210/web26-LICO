import { Routes, Route } from 'react-router-dom';
import Layout from '@layouts/Layout';
import HomePage from '@pages/HomePage';
import FollowingPage from '@pages/FollowingPage';
import CategoryPage from '@pages/CategoryPage';
import CategoryDetailPage from '@pages/CategoryPage/CategoryDetailPage';
import LivePage from '@pages/LivePage';
import LivesPage from '@pages/LivesPage';
import StudioPage from '@pages/StudioPage';
import LoginPage from '@pages/LoginPage';
import LoginCallback from '@pages/LoginPage/LoginCallback';
import ProtectedRoute from './ProtectedRoute';

const publicRoutes = [
  { path: '/', element: <HomePage /> },
  { path: '/category', element: <CategoryPage /> },
  { path: '/category/:categoryId', element: <CategoryDetailPage /> },
  { path: '/live/:id', element: <LivePage /> },
  { path: '/lives', element: <LivesPage /> },
  { path: '/login', element: <LoginPage /> },
];

const protectedRoutes = [
  { path: '/following', element: <FollowingPage /> },
  { path: '/studio', element: <StudioPage /> },
];

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/studio"
        element={
          <ProtectedRoute>
            <StudioPage />
          </ProtectedRoute>
        }
      />

      <Route path="/auth/callback/:provider" element={<LoginCallback />} />

      <Route element={<Layout />}>
        {publicRoutes.map(route => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}

        {protectedRoutes.map(route => (
          <Route key={route.path} path={route.path} element={<ProtectedRoute>{route.element}</ProtectedRoute>} />
        ))}
      </Route>
    </Routes>
  );
}
