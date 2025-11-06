// StaffIndex.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotFoundPage from '../general-pages/NotFoundPage';
import { checkLoginStatus, logout, type UserData } from '../../auth/authUtils';
import { BottomNav, CircleIcon, ClockIcon, DoorIcon } from './utils/bottomNavMenu';
import '..//..//styles/stafforders.css';

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
  const [activeFilter, setActiveFilter] = useState('new');
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    // Add your filter logic here
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
        <div className="staff-index-container">
          <header className="staff-header">
            <div className="logo-container">
              <div className="logo-circle">
                <span>Cafe<br />Logos</span>
              </div>
            </div>
            <div className="user-info">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor" />
              </svg>
              <span>Username</span>
            </div>
          </header>

          <main className="staff-main">
            <h1 className="staff-page-headers">Order</h1>

            <div className="filter-buttons">
              <button
                className={`filter-button ${activeFilter === 'new' ? 'active' : ''}`}
                onClick={() => handleFilterChange('new')}
              >
                New(3)
              </button>
              <button
                className={`filter-button ${activeFilter === 'inprogress' ? 'active' : ''}`}
                onClick={() => handleFilterChange('inprogress')}
              >
                In progress(11)
              </button>
              <button
                className={`filter-button ${activeFilter === 'finished' ? 'active' : ''}`}
                onClick={() => handleFilterChange('finished')}
              >
                finished
              </button>
            </div>

            <div className="search-container">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="currentColor" />
              </svg>
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            {/* Order list will go here */}
          </main>

          <BottomNav items={navItems} />
        </div>
      );
    }
  }
}