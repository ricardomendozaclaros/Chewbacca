import { useAuth0 } from '@auth0/auth0-react';
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const { user, isAuthenticated } = useAuth0();
  const [userRole, setUserRole] = useState(null);
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    const loadUserRole = async () => {
      if (isAuthenticated && user) {
        // Obtener el rol desde los claims del usuario usando la variable de entorno
        const namespace = import.meta.env.VITE_AUTH0_DOMAIN;
        const role = user[`${namespace}/roles`] || 
                    user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 
                    ['Demo']; // Role por defecto
        
        setUserRole(Array.isArray(role) ? role[0] : role);
      }
    };

    const loadMenuItems = async () => {
      if (userRole) {
        try {
          const menuData = await import(`../resources/TOCs/${userRole}.json`);
          setMenuItems(menuData.default);
        } catch (error) {
          console.error('Error loading menu:', error);
          const defaultMenu = await import('../resources/TOCs/Demo.json');
          setMenuItems(defaultMenu.default);
        }
      }
    };

    loadUserRole();
    if (userRole) loadMenuItems();
  }, [isAuthenticated, user, userRole]);

  return { userRole, menuItems };
};