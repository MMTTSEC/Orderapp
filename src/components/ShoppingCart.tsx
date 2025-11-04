import { useState } from 'react';
import '../styles/shoppingCart.css';

type SizeOption = "Liten" | "Mellan" | "Stor";

type SizePrice = {
  size: SizeOption;
  price: number;
};

type CartItem = {
  id: number;
  name: string;
  amount: number;
  price?: number;
  sizes?: SizePrice[];
  selectedSize?: SizeOption;
};

interface ShoppingCartProps {
  items: CartItem[];
  onUpdateAmount: (id: number, delta: number) => void;
  onRemoveItem: (id: number) => void;
}

export default function ShoppingCart({ items, onUpdateAmount, onRemoveItem }: ShoppingCartProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getItemPrice = (item: CartItem): number => {
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

  return (
    <div className={`shopping-cart ${isExpanded ? 'expanded' : ''}`}>
      <div className="cart-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h2>Min Order ({activeItems.length})</h2>
        <span>{getTotalPrice()} kr</span>
      </div>

      {isExpanded && (
        <div className="cart-items">
          {activeItems.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="item-info">
                <span className="item-name">{item.name}</span>
                {item.selectedSize && <span className="item-size">{item.selectedSize}</span>}
                <span className="item-price">{getItemPrice(item)} kr</span>
              </div>

              <div className="item-actions">
                <button 
                  className="quantity-btn"
                  onClick={() => onUpdateAmount(item.id, -1)}
                >
                  <i className="bi bi-dash-lg"></i>
                </button>
                <span className="quantity">{item.amount}</span>
                <button 
                  className="quantity-btn"
                  onClick={() => onUpdateAmount(item.id, 1)}
                >
                  <i className="bi bi-plus-lg"></i>
                </button>
                <button 
                  className="remove-btn"
                  onClick={() => onRemoveItem(item.id)}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}