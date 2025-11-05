import { useState } from 'react';
import '../styles/shoppingCart.css';

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

interface ShoppingCartProps {
  items: Item[];
  onUpdateAmount: (id: number, delta: number, size?: SizeOption) => void;
  onRemoveItem: (id: number, size?: SizeOption) => void;
  onConfirm: () => void; // new prop to open confirmation overlay
}

export default function ShoppingCart({ 
  items, 
  onUpdateAmount, 
  onRemoveItem,
  onConfirm
}: ShoppingCartProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getItemPrice = (item: Item): number => {
    if (item.sizes) {
      const selected = item.sizes.find((s) => s.size === item.selectedSize);
      return selected ? selected.price : item.sizes[0].price;
    }
    return item.price ?? 0;
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (getItemPrice(item) * item.amount), 0);
  };

  const activeItems = items.filter(item => item.amount > 0);

  // Don't render anything if there are no items in the cart
  if (activeItems.length === 0) {
    return null;
  }

  return (
    <div className={`shopping-cart ${isExpanded ? 'expanded' : ''}`}>
      <div className="cart-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h1>Din Order ({activeItems.length})</h1>
      </div>

      {isExpanded && (
        <div className="cart-items">
          {activeItems.map((item) => (
            <div key={`${item.id}-${item.selectedSize || ''}`} className="cart-item">
              <div className="item-info">
                <img src={item.image} alt={item.name} className="cart-item-image" />
                <div className="item-meta">
                  <h3 className="item-name">{item.name}</h3>
                  {item.selectedSize && <span className="item-size">({item.selectedSize})</span>}
                </div>
              </div>

              <div className="item-actions">
                <span className="item-price">{getItemPrice(item)} kr</span>
                <div className="item-quantity-controls">
                  <button 
                    className="quantity-btn"
                    onClick={() => onUpdateAmount(item.id, -1, item.selectedSize)}
                    disabled={item.amount <= 0}
                  >
                    <i className="bi bi-dash-lg"></i>
                  </button>
                  <span className="quantity">{item.amount}</span>
                  <button 
                    className="quantity-btn"
                    onClick={() => onUpdateAmount(item.id, 1, item.selectedSize)}
                  >
                    <i className="bi bi-plus-lg"></i>
                  </button>
                </div>  
                <button 
                  className="remove-btn"
                  onClick={() => onRemoveItem(item.id, item.selectedSize)}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          ))}
          <div className="cart-total">
            <span className="full-price-span">TOTAL:</span>
            <span className="full-price-amount">{getTotalPrice()} kr</span>
          </div>
          <button className="btn-confirm-order" onClick={onConfirm}>Bekräfta Order</button>
        </div>
      )}
    </div>
  );
}