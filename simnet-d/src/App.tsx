import { BrowserRouter, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { AppRouter } from './Router';
import { AuthProvider } from './lib/AuthContext';

const queryClient = new QueryClient();

function AppLayout() {
  const location = useLocation();
  // Hide header/footer on full-screen simulation modules
  const isSimulationRoute = location.pathname.startsWith('/modules/');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isSimulationRoute && <Header />}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <AppRouter />
      </main>
      {!isSimulationRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
