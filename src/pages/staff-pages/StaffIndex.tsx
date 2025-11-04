// StaffIndex.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotFoundPage from '../general-pages/NotFoundPage';
import { checkLoginStatus, logout, type UserData } from '../../auth/authUtils';
import { BottomNav, CircleIcon, ClockIcon, DoorIcon } from './utils/bottomNavMenu';

// /Orders/new,inprogress & finished from our mockup
StaffIndex.route = {
  path: '/staff/'
};

export default function StaffIndex() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  const verifyLogin = async () => {
    const { isAuthorized: authorized, userData: data } = await checkLoginStatus();
    setIsAuthorized(authorized);
    setUserData(data);
    setLoading(false);
  };

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      setIsAuthorized(false);
      navigate('/staff/login');
    }
  };

  const handleNavigation = (tab: string) => {
    setActiveTab(tab);
    // Add your navigation logic here
    switch (tab) {
      case 'orders':
        navigate('/staff/orders');
        break;
      case 'history':
        navigate('/staff/history');
        break;
      case 'signout':
        handleLogout();
        break;
    }
  };

  useEffect(() => {
    verifyLogin();
  }, []);

  // Define navigation items
  const navItems = [
    {
      id: 'orders',
      label: 'orders',
      icon: <CircleIcon />,
      onClick: () => handleNavigation('orders'),
      isActive: activeTab === 'orders',
    },
    {
      id: 'history',
      label: 'history',
      icon: <ClockIcon />,
      onClick: () => handleNavigation('history'),
      isActive: activeTab === 'history',
    },
    {
      id: 'signout',
      label: 'sign out',
      icon: <DoorIcon />,
      onClick: () => handleNavigation('signout'),
      isActive: activeTab === 'signout',
    },
  ];

  if (!loading) {
    if (!isAuthorized) {
      return <NotFoundPage />;
    }
    else if (isAuthorized) {
      return (
        <>
          <h1>Welcome, {userData?.username}!</h1>
          <button type="button" onClick={handleLogout} style={{ marginTop: '1rem', width: '50%' }}>
            Logout
          </button>

          {/* Bottom Navigation */}
          <BottomNav items={navItems} />
        </>
      );
    }
  }
}