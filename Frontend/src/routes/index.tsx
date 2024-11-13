import { Routes, Route } from 'react-router-dom';
import Layout from '@/layouts/Layout';
import HomePage from '@/pages/HomePage';
import FollowingPage from '@/pages/FollowingPage';
import CategoryPage from '@/pages/CategoryPage';
import CategoryDetailPage from '@/pages/CategoryPage/CategoryDetailPage';
import LivePage from '@/pages/LivePage';
import LivesPage from '@/pages/LivesPage';
import StudioPage from '@/pages/StudioPage';
import LoginPage from '@/pages/LoginPage';
import LoginCallback from '@/pages/LoginPage/LoginCallback';
import ProtectedRoute from './ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth/:provider/callback" element={<LoginCallback />} />
      <Route
        path="/studio/:userId"
        element={
          <ProtectedRoute>
            <StudioPage />
          </ProtectedRoute>
        }
      />

      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/category" element={<CategoryPage />} />
        <Route path="/category/:categoryId" element={<CategoryDetailPage />} />
        <Route path="/live/:id" element={<LivePage />} />
        <Route path="/lives" element={<LivesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/following"
          element={
            <ProtectedRoute>
              <FollowingPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
