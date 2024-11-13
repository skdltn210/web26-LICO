import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import AppRoutes from '@routes/index';
import { queryClient } from '@/config/queryClient';
import { useAuthStore } from '@/store/useAuthStore';

export default function App() {
  const setAuthenticated = useAuthStore(state => state.setAuthenticated);

  useEffect(() => {
    const jwt = document.cookie.includes('jwt=');
    setAuthenticated(jwt);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppRoutes />
      </Router>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
