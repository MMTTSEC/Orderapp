// /orders/:id from our mockup
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { checkLoginStatus, type UserData } from '../../auth/authUtils';
import NotFoundPage from '../general-pages/NotFoundPage';
import { StaffHeader } from './utils/staffheader';
import { BottomNav, CircleIcon, ClockIcon, DoorIcon } from './utils/bottomNavMenu';
import '../../styles/stafforder.css';

StaffOrder.route = {
  path: '/staff/order/:id'
};

interface Product {
  id: string;
  name: string;
  completed: boolean;
}

interface OrderDetails {
  id: string;
  orderNumber: string;
  placedAt: string;
  products: Product[];
  status: string;
}

export default function StaffOrder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [productStates, setProductStates] = useState<{ [key: string]: boolean }>({});

  const verifyLogin = async () => {
    const { isAuthorized: authorized, userData: data } = await checkLoginStatus();
    setIsAuthorized(authorized);
    setUserData(data);
    setLoading(false);
  };

  const fetchOrderDetails = async () => {
    try {
      // First try to fetch from CustomerOrder endpoint
      let response = await fetch(`/api/CustomerOrder/${id}`);

      if (!response.ok) {
        // If not found, try HandleOrder endpoint
        response = await fetch(`/api/expand/HandleOrder/${id}`);
      }

      if (!response.ok) {
        throw new Error('Order not found');
      }

      const data = await response.json();

      // Map the data to OrderDetails structure
      let orderData: OrderDetails;

      if (data.customerOrder) {
        // Data from HandleOrder endpoint
        orderData = {
          id: data.id,
          orderNumber: data.customerOrder.title,
          placedAt: data.customerOrder.orderPlacedAt,
          products: data.customerOrder.product || [],
          status: data.orderStatus?.title || 'New'
        };
      } else {
        // Data from CustomerOrder endpoint
        orderData = {
          id: data.id,
          orderNumber: data.title,
          placedAt: data.orderPlacedAt,
          products: data.product || [],
          status: 'New'
        };
      }

      setOrderDetails(orderData);

      // Initialize product states
      const initialStates: { [key: string]: boolean } = {};
      orderData.products.forEach((product: any) => {
        initialStates[product.id || product] = false;
      });
      setProductStates(initialStates);

    } catch (error) {
      console.error('Error fetching order details:', error);
      setOrderDetails(null);
    }
  };

  const handleProductToggle = (productId: string) => {
    setProductStates(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const handleCompleteOrder = () => {
    console.log('Completing order:', id);
    // Add your complete order logic here
    // Navigate back to orders list
    navigate('/staff/');
  };

  const handleCancelOrder = () => {
    console.log('Cancelling order:', id);
    // Add your cancel order logic here
    // Navigate back to orders list
    navigate('/staff/');
  };

  const handleNavigation = (tab: string) => {
    setActiveTab(tab);
    switch (tab) {
      case 'orders':
        navigate('/staff/');
        break;
      case 'history':
        navigate('/staff/history');
        break;
      case 'signout':
        // Add logout logic
        break;
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

  useEffect(() => {
    verifyLogin();
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

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

    if (!orderDetails) {
      return (
        <div>
          <StaffHeader username={userData?.username || "Username"} logoText="Cafe\nLogos" />
          <div className="order-not-found">
            <h2>Order not found</h2>
            <button onClick={() => navigate('/staff/')}>Back to Orders</button>
          </div>
          <BottomNav items={navItems} />
        </div>
      );
    }

    return (
      <div className="staff-order-container">
        <StaffHeader username={userData?.username || "Username"} logoText="Cafe\nLogos" />

        <main className="staff-order-main">
          <div className="order-header">
            <h1>Order Details</h1>
            <h2 className="order-number">#{orderDetails.orderNumber}</h2>
          </div>

          <div className="order-info-card">
            <div className="customer-info">
              <div className="customer-name">Order: {orderDetails.orderNumber}</div>
              <div className="order-time">Placed: {formatTimeAgo(orderDetails.placedAt)}</div>
            </div>
            <button
              className="cancel-button"
              onClick={handleCancelOrder}
              aria-label="Cancel order"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="white" />
              </svg>
            </button>
          </div>

          <div className="products-list">
            {orderDetails.products
              .filter((product: any) => product.name || product.title)
              .map((product: any, index: number) => {
                const productId = product.id || product;
                const productName = product.name || product.title;
                const isCompleted = productStates[productId] || false;

                return (
                  <div key={productId} className="product-item">
                    <button
                      className={`product-checkbox ${isCompleted ? 'checked' : ''}`}
                      onClick={() => handleProductToggle(productId)}
                      aria-label={`Mark ${productName} as ${isCompleted ? 'incomplete' : 'complete'}`}
                    >
                      {isCompleted && (
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white" />
                        </svg>
                      )}
                    </button>
                    <span className="product-name">{productName}</span>
                  </div>
                );
              })}
          </div>

          <button
            className="complete-button"
            onClick={handleCompleteOrder}
          >
            Completed
          </button>
        </main>

        <BottomNav items={navItems} />
      </div>
    );
  }

  return null;
}