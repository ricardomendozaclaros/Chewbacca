import { useAuth0 } from '@auth0/auth0-react';
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const { user, isAuthenticated } = useAuth0();
  const [userRole, setUserRole] = useState(null);
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    const loadUserRole = async () => {
      if (isAuthenticated && user) {
        
        
        // Obtener el rol desde los claims del usuario
        const namespace = 'https://dev-a76h4mqeinsaf6bn.us.auth0.com';
        const role = user[`${namespace}/roles`] || 
                    user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 
                    ['Demo']; // Role por defecto
        
        //console.log('Role found:', role);
        setUserRole(Array.isArray(role) ? role[0] : role);
      }
    };

    const loadMenuItems = async () => {
      if (userRole) {
        try {
          //console.log('Loading menu for role:', userRole);
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