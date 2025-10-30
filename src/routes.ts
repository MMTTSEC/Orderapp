import type Route from './interfaces/Route.ts';
import { createElement } from 'react';

// page components
// general page
import NotFoundPage from './pages/general-pages/NotFoundPage.tsx';
// order pages
import OrderIndex from './pages/order-pages/OrderIndex.tsx';
import OrderSelection from './pages/order-pages/OrderSelection.tsx';
import OrderConfirmation from './pages/order-pages/OrderConfirmation.tsx';
import OrderReceipt from './pages/order-pages/OrderReceipt.tsx';
import OrderPayment from './pages/order-pages/OrderPayment.tsx';
import OrderCompleted from './pages/order-pages/OrderCompleted.tsx';
import OrderDisplay from './pages/order-pages/OrderDisplay.tsx';
// staff pages
import StaffLogin from './pages/staff-pages/StaffLogin.tsx';
import StaffIndex from './pages/staff-pages/StaffIndex.tsx';
import StaffOrder from './pages/staff-pages/StaffOrder.tsx';
import StaffOrderHistory from './pages/staff-pages/StaffOrderHistory.tsx';

export default [
  NotFoundPage,
  OrderIndex,
  OrderSelection,
  OrderConfirmation,
  OrderReceipt,
  OrderPayment,
  OrderCompleted,
  OrderDisplay,
  StaffLogin,
  StaffIndex,
  StaffOrder,
  StaffOrderHistory
]
  // map the route property of each page component to a Route
  .map(x => (({ element: createElement(x), ...x.route }) as Route))
  // sort by index (and if an item has no index, sort as index 0)
  .sort((a, b) => (a.index || 0) - (b.index || 0));