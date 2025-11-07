// StaffIndex.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotFoundPage from '../general-pages/NotFoundPage';
import { checkLoginStatus, logout, type UserData } from '../../auth/authUtils';
import { BottomNav, CircleIcon, ClockIcon, DoorIcon } from './utils/bottomNavMenu';
import { StaffHeader } from './utils/staffheader';
import { FilterButtons } from './utils/filterbuttons';
import { SearchBar } from './utils/searchbar';
import { OrdersList } from './utils/orderslist';
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

  const fetchOrders = async (filter: string = 'new') => {
    try {
      let endpoint = '';

      // Determine endpoint based on filter
      if (filter === 'new') {
        endpoint = 'http://localhost:5001/api/CustomerOrder';
      } else if (filter === 'inprogress' || filter === 'finished') {
        endpoint = 'http://localhost:5001/api/expand/HandleOrder';
      }

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      let data = await response.json();

      // Filter data based on orderStatus if using HandleOrder endpoint
      if (filter === 'inprogress') {
        data = data.filter((order: any) => {
          const status = order.orderStatus?.title?.toLowerCase() || order.orderStatus?.orderStatus?.toLowerCase() || '';
          return status === 'in progress' || status === 'inprogress' || status === 'pending';
        });
      } else if (filter === 'finished') {
        data = data.filter((order: any) => {
          const status = order.orderStatus?.title?.toLowerCase() || order.orderStatus?.orderStatus?.toLowerCase() || '';
          return status === 'finished' || status === 'completed';
        });
      }

      // Map the data to match the Order interface structure
      const mappedOrders = data.map((order: any) => {
        // For HandleOrder endpoint, extract customerOrder data
        if (order.customerOrder) {
          return {
            id: order.id,
            title: order.customerOrder.title,
            product: order.customerOrder.product,
            orderId: order.customerOrder.orderId,
            orderPlacedAt: order.customerOrder.orderPlacedAt
          };
        }
        // For CustomerOrder endpoint, use data directly
        return order;
      });

      // Sort orders by orderPlacedAt, oldest first (ascending order)
      const sortedOrders = mappedOrders.sort((a: Order, b: Order) => {
        return new Date(a.orderPlacedAt).getTime() - new Date(b.orderPlacedAt).getTime();
      });
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
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
    // Fetch orders based on the selected filter
    fetchOrders(filter);
  };

  const handleConfirmOrder = (orderId: string) => {
    console.log('Confirming order:', orderId);
    // Add your confirm order logic here
  };

  const handleCancelOrder = (orderId: string) => {
    console.log('Cancelling order:', orderId);
    // Add your cancel order logic here
  };

  useEffect(() => {
    verifyLogin();
    fetchOrders(activeFilter);
  }, []);

  // Fetch orders when filter changes
  useEffect(() => {
    fetchOrders(activeFilter);
  }, [activeFilter]);

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

            <OrdersList
              orders={orders}
              onConfirm={handleConfirmOrder}
              onCancel={handleCancelOrder}
            />
          </main>

          <BottomNav items={navItems} />
        </div>
      );
    }
  }
}