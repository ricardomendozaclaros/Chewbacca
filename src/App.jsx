import { useAuth0 } from '@auth0/auth0-react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home';
import Page1 from './pages/Page1';
import Layout from './pages/Layout';
import Error from './pages/Error';

function App() {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation(); // Añadimos esto para obtener la ubicación actual

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      // Guardamos la ruta actual antes de redireccionar al login
      sessionStorage.setItem('returnTo', location.pathname);
      loginWithRedirect();
    } else if (isAuthenticated && sessionStorage.getItem('returnTo')) {
      // Si hay una ruta guardada, navegamos a ella y la limpiamos
      const returnTo = sessionStorage.getItem('returnTo');
      sessionStorage.removeItem('returnTo');
      if (returnTo !== '/') {
        navigate(returnTo);
      }
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="page1" element={<Page1 />} />
        <Route path="error" element={<Error />} />
        <Route path="callback" element={<div>Loading callback...</div>} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;