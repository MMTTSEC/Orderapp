import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/orderConfirmation.css';
import '../styles/shoppingCart.css'; // reuse cart styles for consistent look

type SizeOption = "Liten" | "Mellan" | "Stor";

type SizePrice = {
  size: SizeOption;
  price: number;
};

type Item = {
  id: number;
  name: string;
  image: string;
  amount: number;
  price?: number;
  sizes?: SizePrice[];
  selectedSize?: SizeOption;
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
    if (item.sizes) {
      const selected = item.sizes.find((s) => s.size === item.selectedSize);
      return selected ? selected.price : item.sizes[0].price;
    }
    return item.price ?? 0;
  };

  const getTotalPrice = () => items.reduce((total, item) => total + (getItemPrice(item) * item.amount), 0);

  return (
    <div className="order-confirmation-overlay">
      <div className="main-container order-confirmation-page">
        <div className="confirmation-header">
          <button type="button" className="return-button" onClick={onClose}>
            <i className="bi bi-arrow-return-left"></i> Return
          </button>
          <h1>Din Order</h1>
        </div>

        <div className="confirmation-body">
          <div>
            {items.length === 0 ? (
              <p>Inga artiklar i beställningen.</p>
            ) : (
              <div className="cart-items" style={{ background: 'transparent', padding: 0 }}>
                {items.map(item => (
                  <div key={`${item.id}-${item.selectedSize || ''}`} className="cart-item" style={{ marginBottom: '1rem' }}>
                    <div className="item-info">
                      <img src={item.image} alt={item.name} className="cart-item-image" />
                      <div className="item-meta">
                        <h3 className="item-name">{item.name}</h3>
                        {item.selectedSize && <span className="item-size">({item.selectedSize})</span>}
                      </div>
                    </div>

                    <div className="item-actions">
                      <span className="item-price">{getItemPrice(item)} kr</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="quantity">{item.amount}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="cart-total" style={{ marginTop: '2rem', background: 'transparent', borderTop: '1px dashed #ddd' }}>
                  <span className="full-price-span">TOTAL:</span>
                  <span className="full-price-amount">{getTotalPrice()} kr</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
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