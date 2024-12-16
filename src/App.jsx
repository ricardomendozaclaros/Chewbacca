import { useAuth0 } from '@auth0/auth0-react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home';
import About from './pages/About';
import Layout from './pages/Layout';
import Error from './pages/Error';

function App() {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      loginWithRedirect();
    } else if (isAuthenticated) {
      // Redirige a la página principal si el usuario está autenticado
      navigate('/');
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="error" element={<Error />} />
        <Route path="callback" element={<div>Loading callback...</div>} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
