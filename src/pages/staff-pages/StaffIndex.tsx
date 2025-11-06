// StaffIndex.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotFoundPage from '../general-pages/NotFoundPage';
import { checkLoginStatus, logout, type UserData } from '../../auth/authUtils';
import { BottomNav, CircleIcon, ClockIcon, DoorIcon } from './utils/bottomNavMenu';
import { StaffHeader } from './utils/staffheader';
import { FilterButtons } from './utils/filterbuttons';
import { SearchBar } from './utils/searchbar';
import '..//..//styles/stafforders.css';

// /Orders/new,inprogress & finished from our mockup
StaffIndex.route = {
  path: '/staff/'
};

interface Order {
  id: string;
  title: string;
  product: string[];
  orderId: number | object;
  orderPlacedAt: string;
}

export default function StaffIndex() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [activeFilter, setActiveFilter] = useState('new');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);

  const verifyLogin = async () => {
    const { isAuthorized: authorized, userData: data } = await checkLoginStatus();
    setIsAuthorized(authorized);
    setUserData(data);
    setLoading(false);
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/CustomerOrder');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      // Sort orders by orderPlacedAt, oldest first (ascending order)
      const sortedOrders = data.sort((a: Order, b: Order) => {
        return new Date(a.orderPlacedAt).getTime() - new Date(b.orderPlacedAt).getTime();
      });
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const orderDate = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}min ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
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
    fetchOrders();
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

  // Define filter buttons
  const filterButtons = [
    {
      id: 'new',
      label: 'New',
      count: 3,
      isActive: activeFilter === 'new',
      onClick: () => handleFilterChange('new'),
    },
    {
      id: 'inprogress',
      label: 'In progress',
      count: 11,
      isActive: activeFilter === 'inprogress',
      onClick: () => handleFilterChange('inprogress'),
    },
    {
      id: 'finished',
      label: 'finished',
      isActive: activeFilter === 'finished',
      onClick: () => handleFilterChange('finished'),
    },
  ];

  if (!loading) {
    if (!isAuthorized) {
      return <NotFoundPage />;
    }
    else if (isAuthorized) {
      return (
        <div className="staff-index-container">
          <StaffHeader username="Username" logoText="Cafe\nLogos" />

          <main className="staff-main">
            <h1 className="staff-page-headers">Order</h1>

            <FilterButtons filters={filterButtons} />

            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search orders..."
            />

            {/* Order list */}
            <div className="orders-list">
              {orders.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>
                  No orders available
                </p>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="order-card">
                    <div className="order-indicator"></div>
                    <div className="order-info">
                      <div className="order-number">Order: #{order.title}</div>
                      <div className="order-time">Placed: {formatTimeAgo(order.orderPlacedAt)}</div>
                    </div>
                    <div className="order-actions">
                      <button className="action-button confirm" aria-label="Confirm order">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white" />
                        </svg>
                      </button>
                      <button className="action-button cancel" aria-label="Cancel order">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="white" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </main>

          <BottomNav items={navItems} />
        </div>
      );
    }
  }
}