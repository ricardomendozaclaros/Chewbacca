import { useAuth0 } from '@auth0/auth0-react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home';
import Page1 from './pages/Page1';
import Page2 from './pages/Page2';
import Page3 from './pages/Page3';
import Page4 from './pages/Page4';
import Page5 from './pages/Page5';
import Layout from './pages/Layout';
import Error from './pages/Error';
import Filtros from './pages/Filters/Filters';

function App() {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      sessionStorage.setItem('returnTo', location.pathname);
      loginWithRedirect({
        appState: { returnTo: location.pathname }
      });
    }
  }, [isAuthenticated, isLoading]);

  // Redirigir inmediatamente si estamos autenticados
  useEffect(() => {
    if (isAuthenticated && location.pathname === '/callback') {
      navigate('/');
    }
  }, [isAuthenticated, location]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="page1" element={<Page1 />} />
        <Route path="page2" element={<Page2 />} />
        <Route path="page3" element={<Page3 />} />
        <Route path="page4" element={<Page4 />} />
        <Route path="page5" element={<Page5 />} />
        <Route path="error" element={<Error />} />
        <Route path="filters" element={<Filtros />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;