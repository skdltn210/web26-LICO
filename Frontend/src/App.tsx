import { BrowserRouter as Router } from 'react-router-dom';
import { ChannelProvider } from '@/contexts/ChannelContext';
import AppRoutes from '@routes/index';

export default function App() {
  return (
    <Router>
      <ChannelProvider>
        <AppRoutes />
      </ChannelProvider>
    </Router>
  );
}
