// /orders/:id from our mockup
import { useEffect, useState, useRef } from 'react';
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
  title: string;
  quantity: number;
  productId: string;
  status: boolean;
  sizeId: string;
  price: number;
}

interface OrderDetails {
  id: string;
  orderNumber: string;
  placedAt: string;
  products: Product[];
  status: string;
  handleOrderId?: string;
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
  const [productSizes, setProductSizes] = useState<{ [key: string]: string }>({});
  const statusMapRef = useRef<Record<string, string>>({});
  const statusFetchPromiseRef = useRef<Promise<Record<string, string>> | null>(null);

  const fetchStatusMap = async (): Promise<Record<string, string>> => {
    if (Object.keys(statusMapRef.current).length > 0) {
      return statusMapRef.current;
    }

    if (!statusFetchPromiseRef.current) {
      statusFetchPromiseRef.current = (async () => {
        const response = await fetch('/api/raw/OrderStatus', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          throw new Error(errorText || `Failed to fetch order statuses (${response.status})`);
        }

        const data = await response.json();
        const map: Record<string, string> = {};

        if (Array.isArray(data)) {
          data.forEach((status: any) => {
            const rawTitle = status?.TitlePart?.Title ?? status?.DisplayText ?? status?.title ?? status?.Title ?? status?.displayText;
            const id = status?.ContentItemId ?? status?.contentItemId ?? status?.id;

            if (typeof rawTitle === 'string' && typeof id === 'string') {
              map[rawTitle.trim().toLowerCase()] = id;
            }
          });
        }

        statusMapRef.current = map;
        statusFetchPromiseRef.current = null;
        return map;
      })();
    }

    try {
      return await statusFetchPromiseRef.current;
    } finally {
      statusFetchPromiseRef.current = null;
    }
  };

  const getStatusId = async (statusName: string) => {
    const normalized = statusName.trim().toLowerCase();
    const map = await fetchStatusMap();
    return map[normalized];
  };

  const verifyLogin = async () => {
    const { isAuthorized: authorized, userData: data } = await checkLoginStatus();
    setIsAuthorized(authorized);
    setUserData(data);
    setLoading(false);
  };

  const fetchSizeInfo = async (sizeId: string): Promise<string> => {
    try {
      const response = await fetch(`http://localhost:5173/api/Size/${sizeId}`);
      if (!response.ok) {
        throw new Error('Size not found');
      }
      const data = await response.json();
      return data.portionSize || data.title || '';
    } catch (error) {
      console.error('Error fetching size info:', error);
      return '';
    }
  };

  const fetchOrderDetails = async () => {
    try {
      // Fetch order from the CustomerOrder endpoint
      const response = await fetch(`http://localhost:5173/api/expand/CustomerOrder/${id}`);

      if (!response.ok) {
        throw new Error('Order not found');
      }

      const data = await response.json();

      // Also try to fetch the HandleOrder to get handleOrderId and status
      let handleOrderId: string | undefined;
      let orderStatus = 'New';
      try {
        const handleResponse = await fetch('http://localhost:5173/api/expand/HandleOrder');
        if (handleResponse.ok) {
          const handleData = await handleResponse.json();
          if (Array.isArray(handleData)) {
            const matchingHandle = handleData.find((handle: any) => {
              const customerId = handle?.customerOrder?.id ?? handle?.customerOrderId;
              return customerId === data.id;
            });
            if (matchingHandle) {
              handleOrderId = matchingHandle.id ?? matchingHandle.contentItemId;
              // Extract status from orderStatus object
              const statusObj = matchingHandle.orderStatus ?? matchingHandle.orderStatusId;
              if (statusObj && typeof statusObj === 'object') {
                orderStatus = statusObj.title ?? statusObj.Title ?? statusObj.displayText ?? statusObj.DisplayText ?? 'New';
              } else if (typeof statusObj === 'string') {
                orderStatus = statusObj;
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching handle order:', error);
      }

      // Map the data to OrderDetails structure
      // Normalize product(s) to an array of either product objects or product IDs
      let productItems: any[] = [];
      if (Array.isArray(data.product)) {
        productItems = data.product;
      } else if (data.product && typeof data.product === 'object') {
        productItems = [data.product];
      } else if (data.productId) {
        if (Array.isArray(data.productId)) {
          productItems = data.productId;
        } else if (typeof data.productId === 'string') {
          productItems = [data.productId];
        } else if (typeof data.productId === 'object') {
          const maybeId = (data.productId.id ??
            data.productId.contentItemId ??
            (Object.values(data.productId || {}).find((v: any) => typeof v === 'string')));
          if (typeof maybeId === 'string') {
            productItems = [maybeId];
          } else {
            productItems = [data.productId];
          }
        }
      }

      // Check if products are just IDs (strings) or full objects
      // If they're strings, we need to fetch the full product details
      const products = await Promise.all(
        productItems.map(async (item: any) => {
          // If item is a string, it's just an ID - fetch the full product
          if (typeof item === 'string') {
            try {
              const productResponse = await fetch(`http://localhost:5173/api/expand/Product/${item}`);
              if (!productResponse.ok) {
                console.error(`Failed to fetch product ${item}`);
                return null;
              }
              const productData = await productResponse.json();
              return productData;
            } catch (error) {
              console.error(`Error fetching product ${item}:`, error);
              return null;
            }
          }
          // If it's already an object, use it as-is
          return item;
        })
      );

      // Filter out any null values from failed fetches
      const validProducts = products.filter(p => p !== null);

      const orderData: OrderDetails = {
        id: data.id,
        orderNumber: data.title,
        placedAt: data.orderPlacedAt,
        products: validProducts,
        status: orderStatus,
        handleOrderId
      };

      setOrderDetails(orderData);

      // Check if order is finished
      const isFinished = orderStatus.trim().toLowerCase() === 'finished';

      // Initialize product states and fetch sizes
      const initialStates: { [key: string]: boolean } = {};
      const sizes: { [key: string]: string } = {};

      // Fetch size information for each product and initialize states for each quantity
      await Promise.all(
        orderData.products.map(async (product: Product) => {
          const quantity = product.quantity || 1;

          // Initialize state for each quantity instance
          // If order is finished, set all checkboxes to true
          for (let i = 0; i < quantity; i++) {
            const uniqueId = `${product.id}-${i}`;
            initialStates[uniqueId] = isFinished;
          }

          // Fetch size info once per product (not per quantity)
          if (product.sizeId) {
            const sizeInfo = await fetchSizeInfo(product.sizeId);
            sizes[product.id] = sizeInfo;
          }
        })
      );

      setProductStates(initialStates);
      setProductSizes(sizes);

    } catch (error) {
      console.error('Error fetching order details:', error);
      setOrderDetails(null);
    }
  };

  const handleProductToggle = (productId: string) => {
    // Don't allow toggling if order is finished
    if (orderDetails && orderDetails.status.trim().toLowerCase() === 'finished') {
      return;
    }

    setProductStates(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const handleCompleteOrder = async () => {
    if (!orderDetails) {
      console.warn('No order details available');
      return;
    }

    if (!orderDetails.handleOrderId) {
      console.warn('Missing handle order id for order', id);
      alert('This order has not been started yet. Please start it from the orders list first.');
      return;
    }

    try {
      const finishedStatusId = await getStatusId('finished');

      if (!finishedStatusId) {
        alert('Unable to locate the "Finished" status. Please ensure it exists in Order Statuses.');
        return;
      }

      const updateResponse = await fetch(`/api/HandleOrder/${orderDetails.handleOrderId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderStatusId: finishedStatusId
        })
      });

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text().catch(() => '');
        throw new Error(errorText || `Failed to update handle order (${updateResponse.status})`);
      }

      // Navigate back to orders list after successful completion
      navigate('/staff/');
    } catch (error) {
      console.error('Error completing order:', error);
      alert('Could not complete the order. Please try again.');
    }
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

    // Check if order is finished
    const isFinished = orderDetails.status.trim().toLowerCase() === 'finished';

    // Check if all products are completed (accounting for quantities)
    const allProductsCompleted = orderDetails.products.length > 0 &&
      orderDetails.products.every((product: Product) => {
        const quantity = product.quantity || 1;
        // Check if all instances of this product are completed
        for (let i = 0; i < quantity; i++) {
          const uniqueId = `${product.id}-${i}`;
          if (!productStates[uniqueId]) {
            return false;
          }
        }
        return true;
      });

    return (
      <div className="staff-order-container">
        <StaffHeader username={userData?.username || "Username"} logoText="Cafe\nLogos" />

        <main className="staff-order-main">
          <div className="order-header">
            <button className="back-button" onClick={() => navigate('/staff/')} aria-label="Go back to orders list">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" fill="currentColor" />
              </svg>
            </button>
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
            {orderDetails.products.flatMap((product: Product) => {
              const productName = product.title;
              const portionSize = productSizes[product.id] || '';
              const quantity = product.quantity || 1;

              // Create an array of items based on quantity
              return Array.from({ length: quantity }, (_, index) => {
                const uniqueId = `${product.id}-${index}`;
                const isCompleted = productStates[uniqueId] || false;

                return (
                  <div key={uniqueId} className="product-item">
                    <button
                      className={`product-checkbox ${isCompleted ? 'checked' : ''}`}
                      onClick={() => handleProductToggle(uniqueId)}
                      aria-label={`Mark ${productName} as ${isCompleted ? 'incomplete' : 'complete'}`}
                      disabled={isFinished}
                      style={isFinished ? { cursor: 'not-allowed', opacity: 0.8 } : {}}
                    >
                      {isCompleted && (
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white" />
                        </svg>
                      )}
                    </button>
                    <span className="product-name">{productName}</span>
                    {portionSize && <span className="product-size"> - {portionSize}</span>}
                  </div>
                );
              });
            })}
          </div>

          {/* Only show complete button if order is not finished */}
          {!isFinished && (
            <button
              className="complete-button"
              onClick={handleCompleteOrder}
              disabled={!allProductsCompleted}
            >
              Completed
            </button>
          )}
        </main>

        <BottomNav items={navItems} />
      </div>
    );
  }

  return null;
}