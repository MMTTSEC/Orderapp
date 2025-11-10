// StaffIndex.tsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotFoundPage from '../general-pages/NotFoundPage';
import { checkLoginStatus, logout, type UserData } from '../../auth/authUtils';
import { BottomNav, CircleIcon, DoorIcon } from './utils/bottomNavMenu';
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
  handleOrderId?: string;
  status?: 'pending' | 'inprogress' | 'finished' | 'other';
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
  const [orderCounts, setOrderCounts] = useState({
    new: 0,
    inprogress: 0,
    finished: 0
  });
  const statusMapRef = useRef<Record<string, string>>({});
  const statusFetchPromiseRef = useRef<Promise<Record<string, string>> | null>(null);

  const normalizeStatus = (rawStatus: unknown): 'pending' | 'inprogress' | 'finished' | 'other' => {
    if (typeof rawStatus !== 'string') {
      return 'other';
    }

    const status = rawStatus.trim().toLowerCase();

    if (['in progress', 'in_progress', 'inprogress', 'processing', 'ongoing', 'progress'].includes(status)) {
      return 'inprogress';
    }

    if (['finished', 'complete', 'completed', 'done'].includes(status)) {
      return 'finished';
    }

    if (['pending', 'new', 'waiting', 'queued'].includes(status)) {
      return 'pending';
    }

    return 'other';
  };

  const extractHandleStatus = (handleOrder: any): 'pending' | 'inprogress' | 'finished' | 'other' => {
    if (!handleOrder) {
      return 'other';
    }

    const source = handleOrder.orderStatus;

    if (typeof source === 'string') {
      return normalizeStatus(source);
    }

    const rawStatus = source?.title ?? source?.displayText ?? source?.orderStatus ?? source?.status;
    return normalizeStatus(rawStatus);
  };

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

  const fetchOrders = async (filter: string = 'new') => {
    try {
      const commonFetchOptions: RequestInit = {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      };

      let mappedOrders: Order[] = [];

      if (filter === 'new') {
        const [customerResponse, handleResponse] = await Promise.all([
          fetch('/api/CustomerOrder', commonFetchOptions),
          fetch('/api/expand/HandleOrder', commonFetchOptions)
        ]);

        if (!customerResponse.ok) {
          throw new Error('Failed to fetch customer orders');
        }

        if (!handleResponse.ok) {
          throw new Error('Failed to fetch handle orders');
        }

        const [customerData, handleData] = await Promise.all([
          customerResponse.json(),
          handleResponse.json()
        ]);

        const handleStatusByCustomerId: Record<string, { status: 'pending' | 'inprogress' | 'finished' | 'other'; handleOrderId?: string }> = {};

        if (Array.isArray(handleData)) {
          handleData.forEach((handle: any) => {
            const customerId = handle?.customerOrder?.id ?? handle?.customerOrderId ?? handle?.customerOrder?.contentItemId;

            if (typeof customerId === 'string') {
              handleStatusByCustomerId[customerId] = {
                status: extractHandleStatus(handle),
                handleOrderId: handle?.id ?? handle?.contentItemId
              };
            }
          });
        }

        const filteredCustomerOrders = (Array.isArray(customerData) ? customerData : []).filter((order: any) => {
          const statusInfo = handleStatusByCustomerId[order?.id];
          if (!statusInfo) {
            return true;
          }
          return statusInfo.status !== 'inprogress' && statusInfo.status !== 'finished';
        });

        mappedOrders = filteredCustomerOrders.map((order: any) => {
          const statusInfo = handleStatusByCustomerId[order?.id];

          return {
            id: order.id,
            title: order.title,
            product: order.product,
            orderId: order.orderId,
            orderPlacedAt: order.orderPlacedAt,
            handleOrderId: statusInfo?.handleOrderId,
            status: statusInfo?.status
          } satisfies Order;
        });
      } else {
        const handleResponse = await fetch('/api/expand/HandleOrder', commonFetchOptions);

        if (!handleResponse.ok) {
          throw new Error('Failed to fetch handle orders');
        }

        const handleData = await handleResponse.json();

        const filteredHandleOrders = (Array.isArray(handleData) ? handleData : []).filter((order: any) => {
          const status = extractHandleStatus(order);
          if (filter === 'inprogress') {
            return status === 'inprogress';
          }
          if (filter === 'finished') {
            return status === 'finished';
          }
          return true;
        });

        mappedOrders = filteredHandleOrders.map((order: any) => {
          const status = extractHandleStatus(order);
          const handleOrderId = order.id ?? order.contentItemId;

          if (order.customerOrder) {
            return {
              id: order.customerOrder.id ?? order.customerOrder.contentItemId ?? order.customerOrder.title,
              title: order.customerOrder.title,
              product: order.customerOrder.product,
              orderId: order.customerOrder.orderId,
              orderPlacedAt: order.customerOrder.orderPlacedAt,
              handleOrderId,
              status
            } satisfies Order;
          }

          return {
            id: order.id,
            title: order.title ?? order.displayText ?? 'Order',
            product: order.product ?? [],
            orderId: order.orderId ?? order.id,
            orderPlacedAt: order.orderPlacedAt ?? new Date().toISOString(),
            handleOrderId,
            status
          } satisfies Order;
        });
      }

      const sortedOrders = mappedOrders.sort((a: Order, b: Order) => {
        return new Date(a.orderPlacedAt).getTime() - new Date(b.orderPlacedAt).getTime();
      });

      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    }
  };

  const fetchOrderCounts = async () => {
    try {
      const commonFetchOptions: RequestInit = {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      };

      const [newResponse, handleResponse] = await Promise.all([
        fetch('/api/CustomerOrder', commonFetchOptions),
        fetch('/api/expand/HandleOrder', commonFetchOptions)
      ]);

      const newData = newResponse.ok ? await newResponse.json() : [];
      const handleData = handleResponse.ok ? await handleResponse.json() : [];

      const handleStatusByCustomerId: Record<string, { status: 'pending' | 'inprogress' | 'finished' | 'other'; handleOrderId?: string }> = {};

      if (Array.isArray(handleData)) {
        handleData.forEach((order: any) => {
          const customerId = order?.customerOrder?.id ?? order?.customerOrderId ?? order?.customerOrder?.contentItemId;
          if (typeof customerId === 'string') {
            handleStatusByCustomerId[customerId] = {
              status: extractHandleStatus(order),
              handleOrderId: order?.id ?? order?.contentItemId
            };
          }
        });
      }

      const newCount = (Array.isArray(newData) ? newData : []).filter((order: any) => {
        const statusInfo = handleStatusByCustomerId[order?.id];
        if (!statusInfo) {
          return true;
        }
        return statusInfo.status !== 'inprogress' && statusInfo.status !== 'finished';
      }).length;

      const inprogressCount = (Array.isArray(handleData) ? handleData : []).filter((order: any) => extractHandleStatus(order) === 'inprogress').length;

      const finishedCount = (Array.isArray(handleData) ? handleData : []).filter((order: any) => extractHandleStatus(order) === 'finished').length;

      setOrderCounts({
        new: newCount,
        inprogress: inprogressCount,
        finished: finishedCount
      });
    } catch (error) {
      console.error('Error fetching order counts:', error);
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
        navigate('/staff');
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

  const handleConfirmOrder = async (orderId: string) => {
    const targetOrder = orders.find((order) => order.id === orderId);

    if (!targetOrder) {
      console.warn('Could not find order in current list', orderId);
      return;
    }

    try {
      const inProgressStatusId = await getStatusId('in progress');

      if (!inProgressStatusId) {
        alert('Unable to locate the "In progress" status. Please ensure it exists in Order Statuses.');
        return;
      }

      let updateResponse: Response;

      if (targetOrder.handleOrderId) {
        updateResponse = await fetch(`/api/HandleOrder/${targetOrder.handleOrderId}`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            orderStatusId: inProgressStatusId
          })
        });
      } else {
        updateResponse = await fetch('/api/HandleOrder', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: targetOrder.title ?? `Order ${orderId}`,
            customerOrderId: orderId,
            orderStatusId: inProgressStatusId
          })
        });
      }

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text().catch(() => '');
        throw new Error(errorText || `Failed to update handle order (${updateResponse.status})`);
      }

      // Optimistically remove from "New" list and adjust counters locally
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
      setOrderCounts((prev) => ({
        new: Math.max(prev.new - 1, 0),
        inprogress: prev.inprogress + 1,
        finished: prev.finished
      }));

      await Promise.all([
        fetchOrderCounts(),
        fetchOrders(activeFilter)
      ]);
    } catch (error) {
      console.error('Error moving order to In progress:', error);
      alert('Could not move the order to In progress. Please try again.');
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    const targetOrder = orders.find((order) => order.id === orderId);

    if (!targetOrder) {
      console.warn('Could not find order in current list', orderId);
      return;
    }

    if (!targetOrder.handleOrderId) {
      console.warn('Missing handle order id for order', orderId);
      return;
    }

    try {
      const finishedStatusId = await getStatusId('finished');

      if (!finishedStatusId) {
        alert('Unable to locate the "Finished" status. Please ensure it exists in Order Statuses.');
        return;
      }

      const updateResponse = await fetch(`/api/HandleOrder/${targetOrder.handleOrderId}`, {
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

      setOrders((prev) => prev.filter((order) => order.id !== orderId));
      setOrderCounts((prev) => ({
        new: prev.new,
        inprogress: Math.max(prev.inprogress - 1, 0),
        finished: prev.finished + 1
      }));

      await Promise.all([
        fetchOrderCounts(),
        fetchOrders(activeFilter)
      ]);
    } catch (error) {
      console.error('Error moving order to Finished:', error);
      alert('Could not move the order to Finished. Please try again.');
    }
  };

  const handleCancelOrder = (orderId: string) => {
    console.log('Cancelling order:', orderId);
    // Add your cancel order logic here
  };

  const handleOrderClick = (orderId: string) => {
    navigate(`/staff/order/${orderId}`);
  };

  // Filter orders based on search query (only search by order number/title)
  const filteredOrders = orders
    .filter((order) => {
      if (!searchQuery.trim()) return true;
      const orderNumber = order.title.toLowerCase();
      const query = searchQuery.toLowerCase().trim();
      return orderNumber.startsWith(query);
    })
    .sort((a, b) => {
      if (!searchQuery.trim()) return 0;
      const query = searchQuery.toLowerCase().trim();
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();

      // Exact match comes first
      if (aTitle === query && bTitle !== query) return -1;
      if (bTitle === query && aTitle !== query) return 1;

      // Otherwise sort by length (shorter comes first)
      if (aTitle.length !== bTitle.length) {
        return aTitle.length - bTitle.length;
      }

      // If same length, sort alphabetically
      return aTitle.localeCompare(bTitle);
    });

  useEffect(() => {
    verifyLogin();
    fetchOrders(activeFilter);
    fetchOrderCounts();
  }, []);

  // Fetch orders when filter changes
  useEffect(() => {
    fetchOrders(activeFilter);
    fetchOrderCounts();
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
      count: orderCounts.new,
      isActive: activeFilter === 'new',
      onClick: () => handleFilterChange('new'),
    },
    {
      id: 'inprogress',
      label: 'In progress',
      count: orderCounts.inprogress,
      isActive: activeFilter === 'inprogress',
      onClick: () => handleFilterChange('inprogress'),
    },
    {
      id: 'finished',
      label: 'finished',
      count: orderCounts.finished,
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
          <StaffHeader username={userData?.username ?? 'Username'} logoText="Cafe\nLogos" />

          <main className="staff-main">
            <h1 className="staff-page-headers">Order</h1>

            <FilterButtons filters={filterButtons} />

            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search orders..."
            />

            <OrdersList
              orders={filteredOrders}
            onConfirm={activeFilter === 'inprogress' ? handleCompleteOrder : handleConfirmOrder}
              onCancel={handleCancelOrder}
              onOrderClick={activeFilter === 'new' ? undefined : handleOrderClick}
            />
          </main>

          <BottomNav items={navItems} />
        </div>
      );
    }
  }
}