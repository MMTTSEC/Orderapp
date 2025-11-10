import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/orderConfirmation.css';
import '../styles/shoppingCart.css'; // reuse cart styles for consistent look

type SizeOption = string;

type SizePrice = {
  size: SizeOption;
  price: number;
  productId?: string;
  productQuantityId?: string;
};

type Item = {
  id: string;
  name: string;
  image: string;
  amount: number;
  price?: number;
  sizes?: SizePrice[];
  selectedSize?: SizeOption;
  sizeAmounts?: Record<string, number>;
};

interface OrderConfirmationProps {
  items: Item[];
  onClose: () => void;
}

export default function OrderConfirmation({ items, onClose }: OrderConfirmationProps) {
  const navigate = useNavigate();

  // prevent body scroll while overlay is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev || '';
    };
  }, []);

  const getItemPrice = (item: Item): number => {
    const basePrice = item.sizes 
      ? (item.sizes.find(s => s.size === item.selectedSize)?.price ?? item.sizes[0].price)
      : (item.price ?? 0);
    
    return basePrice * item.amount;
  };

  const getTotalPrice = () => items.reduce((total, item) => total + getItemPrice(item), 0);

  return (
    <div className="order-confirmation-overlay">
      <div className="main-container order-confirmation-page">
        <div className="confirmation-header">
          <button type="button" className="return-button" onClick={onClose}>
            <i className="bi bi-arrow-return-left"></i> Tillbaka
          </button>
          <h1>Din Order</h1>
        </div>

        <div className="confirmation-body">
          <div>
            {items.length === 0 ? (
              <p>Inga artiklar i beställningen.</p>
            ) : (
              <div className="cart-items">
                {items.map(item => (
                  <div key={`${item.id}-${item.selectedSize || ''}`} className="cart-item">
                    <div className="item-info">
                      <span className="quantity">{item.amount}x</span>
                      <div className="item-meta">
                        <h3 className="item-name">{item.name}</h3>
                        {item.selectedSize && <span className="item-size">({item.selectedSize})</span>}
                      </div>
                    </div>

                    <div className="item-actions">
                      <span className="item-price">{getItemPrice(item)} kr</span>
                    </div>
                  </div>
                ))}
                <div className="cart-total">
                  <span className="full-price-span">TOTAL SUMMA:</span>
                  <span className="full-price-amount">{getTotalPrice()} kr</span>
                </div>

                <div className="confirmation-actions">
                  <button
                    className="btn-confirm-order"
                    onClick={() => navigate('/order-payment')}
                  ><i className="bi bi-paypal"></i>
                    Till Betalning
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}