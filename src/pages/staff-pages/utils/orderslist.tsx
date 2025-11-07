// OrdersList.tsx
import React from 'react';

interface Order {
    id: string;
    title: string;
    product: string[];
    orderId: number | object;
    orderPlacedAt: string;
}

interface OrdersListProps {
    orders: Order[];
    onConfirm?: (orderId: string) => void;
    onCancel?: (orderId: string) => void;
    onOrderClick?: (orderId: string) => void;
}

export const OrdersList: React.FC<OrdersListProps> = ({ orders, onConfirm, onCancel, onOrderClick }) => {
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

    return (
        <div className="orders-list">
            {orders.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>
                    No orders available
                </p>
            ) : (
                orders.map((order) => (
                    <div
                        key={order.id}
                        className="order-card"
                        onClick={() => onOrderClick?.(order.id)}
                        style={{ cursor: onOrderClick ? 'pointer' : 'default' }}
                    >
                        <div className="order-indicator"></div>
                        <div className="order-info">
                            <div className="order-number-list">Order: #{order.title}</div>
                            <div className="order-time">Placed: {formatTimeAgo(order.orderPlacedAt)}</div>
                        </div>
                        <div className="order-actions">
                            <button
                                className="action-button confirm"
                                aria-label="Confirm order"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onConfirm?.(order.id);
                                }}
                            >
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white" />
                                </svg>
                            </button>
                            <button
                                className="action-button cancel"
                                aria-label="Cancel order"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCancel?.(order.id);
                                }}
                            >
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="white" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};