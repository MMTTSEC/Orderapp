// Order 2-3 from our mockup
import { useState } from "react";
import "../../styles/orderSelection.css";
import ShoppingCart from '../../components/ShoppingCart';

OrderSelection.route = {
  path: '/order-selection'
};

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
  sizeAmounts?: Record<SizeOption, number>; // Add this to track amounts per size
};

export default function OrderSelection() {
   const [activeTab, setActiveTab] = useState<"meal" | "food" | "drink" | "extra">("meal");

  // Example data
const [mealItems, setMealItems] = useState<Item[]>([
    { id: 1, name: "Mål 1", image: "/", amount: 0, price: 100 },
    { id: 2, name: "Mål 2", image: "/", amount: 0, price: 115 },
    { id: 3, name: "Mål 3", image: "/", amount: 0, price: 105 }
  ]);

  const [foodItems, setFoodItems] = useState<Item[]>([
    { id: 4, name: "Burgare 1", image: "/", amount: 0, price: 80 },
    { id: 5, name: "Burgare 2", image: "/", amount: 0, price: 80 },
    { id: 6, name: "Burgare 3", image: "/", amount: 0, price: 80 },
    { id: 7, name: "Burgare 4", image: "/", amount: 0, price: 70 },
    { id: 8, name: "Burgare 5", image: "/", amount: 0, price: 70 },
    { id: 9, name: "Burgare 6", image: "/", amount: 0, price: 35 },
    { id: 10, name: "Burgare 7", image: "/", amount: 0, price: 30 },
    { id: 11, name: "Burgare 8", image: "/", amount: 0, price: 24 },
    { id: 12, name: "Burgare 9", image: "/", amount: 0, price: 24 }
  ]);

  const [drinkItems, setDrinkItems] = useState<Item[]>([
    { 
      id: 13, 
      name: "Cola", 
      image: "/", 
      amount: 0, 
      sizes: [
        { size: "Liten", price: 20 },
        { size: "Mellan", price: 25 },
        { size: "Stor", price: 30 }
      ], 
      selectedSize: "Mellan",
      sizeAmounts: { "Liten": 0, "Mellan": 0, "Stor": 0 }
    },
    { 
      id: 14, 
      name: "Cola Zero", 
      image: "/", 
      amount: 0, 
      sizes: [
        { size: "Liten", price: 20 },
        { size: "Mellan", price: 25 },
        { size: "Stor", price: 30 }
      ], 
      selectedSize: "Mellan",
      sizeAmounts: { "Liten": 0, "Mellan": 0, "Stor": 0 }
    },
    { 
      id: 15, 
      name: "Fanta", 
      image: "/", 
      amount: 0, 
      sizes: [
        { size: "Liten", price: 20 },
        { size: "Mellan", price: 25 },
        { size: "Stor", price: 30 }
      ], 
      selectedSize: "Mellan",
      sizeAmounts: { "Liten": 0, "Mellan": 0, "Stor": 0 }
    },
    { 
      id: 16, 
      name: "Fanta Zero", 
      image: "/", 
      amount: 0, 
      sizes: [
        { size: "Liten", price: 20 },
        { size: "Mellan", price: 25 },
        { size: "Stor", price: 30 }
      ], 
      selectedSize: "Mellan",
      sizeAmounts: { "Liten": 0, "Mellan": 0, "Stor": 0 }
    },
    { 
      id: 17, 
      name: "Sprite", 
      image: "/", 
      amount: 0, 
      sizes: [
        { size: "Liten", price: 20 },
        { size: "Mellan", price: 25 },
        { size: "Stor", price: 30 }
      ], 
      selectedSize: "Mellan",
      sizeAmounts: { "Liten": 0, "Mellan": 0, "Stor": 0 }
    },
    { 
      id: 18, 
      name: "Sprite Zero", 
      image: "/", 
      amount: 0, 
      sizes: [
        { size: "Liten", price: 20 },
        { size: "Mellan", price: 25 },
        { size: "Stor", price: 30 }
      ], 
      selectedSize: "Mellan",
      sizeAmounts: { "Liten": 0, "Mellan": 0, "Stor": 0 }
    },
    { 
      id: 19, 
      name: "Vatten", 
      image: "/", 
      amount: 0, 
      sizes: [
        { size: "Liten", price: 20 },
        { size: "Mellan", price: 25 },
        { size: "Stor", price: 30 }
      ], 
      selectedSize: "Mellan",
      sizeAmounts: { "Liten": 0, "Mellan": 0, "Stor": 0 }
    }
  ]);

  const [extraItems, setExtraItems] = useState<Item[]>([
    { 
      id: 20, 
      name: "Pommes", 
      image: "/", 
      amount: 0, 
      sizes: [
        { size: "Liten", price: 15 },
        { size: "Mellan", price: 25 },
        { size: "Stor", price: 35 }
      ], 
      selectedSize: "Mellan",
      sizeAmounts: { "Liten": 0, "Mellan": 0, "Stor": 0 }
    },
    { id: 21, name: "Ketchup", image: "/", amount: 0, price: 5 },
    { id: 22, name: "Senap", image: "/", amount: 0, price: 5 },
    { id: 23, name: "Dressing", image: "/", amount: 0, price: 10 },
    { 
      id: 24, 
      name: "Sallad", 
      image: "/", 
      amount: 0, 
      sizes: [
        { size: "Liten", price: 15 },
        { size: "Mellan", price: 25 },
        { size: "Stor", price: 35 }
      ], 
      selectedSize: "Mellan",
      sizeAmounts: { "Liten": 0, "Mellan": 0, "Stor": 0 }
    }
  ]);

  const handleAmountChange = (id: number, delta: number, size?: SizeOption) => {
    const updateItemInArray = (items: Item[], setItems: React.Dispatch<React.SetStateAction<Item[]>>) => {
      const item = items.find(i => i.id === id);
      if (!item) return;

      if (item.sizes && size && item.sizeAmounts) {
        // Update amount for specific size
        setItems(prev => prev.map(i => {
          if (i.id === id) {
            const newSizeAmounts = { ...i.sizeAmounts! };
            newSizeAmounts[size] = Math.max(0, (newSizeAmounts[size] || 0) + delta);
            
            // Calculate total amount across all sizes
            const totalAmount = Object.values(newSizeAmounts).reduce((sum, amount) => sum + amount, 0);
            
            return {
              ...i,
              sizeAmounts: newSizeAmounts,
              amount: totalAmount // Update total amount
            };
          }
          return i;
        }));
      } else {
        // For items without sizes
        setItems(prev => prev.map(i => 
          i.id === id ? { ...i, amount: Math.max(0, i.amount + delta) } : i
        ));
      }
    };

    if (mealItems.find(i => i.id === id)) {
      updateItemInArray(mealItems, setMealItems);
    } else if (foodItems.find(i => i.id === id)) {
      updateItemInArray(foodItems, setFoodItems);
    } else if (drinkItems.find(i => i.id === id)) {
      updateItemInArray(drinkItems, setDrinkItems);
    } else if (extraItems.find(i => i.id === id)) {
      updateItemInArray(extraItems, setExtraItems);
    }
  };

  const getItemPrice = (item: Item): number => {
    if (item.sizes) {
      const selected = item.sizes.find((s) => s.size === item.selectedSize);
      return selected ? selected.price : item.sizes[0].price;
    }
    return item.price ?? 0;
  };

  const handleSizeChange = (id: number, size: SizeOption) => {
    const updateItemInArray = (setItems: React.Dispatch<React.SetStateAction<Item[]>>) => {
      setItems(prev => prev.map(i => 
        i.id === id ? { ...i, selectedSize: size } : i
      ));
    };

    if (mealItems.find(i => i.id === id)) {
      updateItemInArray(setMealItems);
    } else if (foodItems.find(i => i.id === id)) {
      updateItemInArray(setFoodItems);
    } else if (drinkItems.find(i => i.id === id)) {
      updateItemInArray(setDrinkItems);
    } else if (extraItems.find(i => i.id === id)) {
      updateItemInArray(setExtraItems);
    }
  };

  const handleRemoveItem = (id: number, size?: SizeOption) => {
    const updateItemInArray = (_items: Item[], setItems: React.Dispatch<React.SetStateAction<Item[]>>) => {
      setItems(prev => prev.map(i => {
        if (i.id === id) {
          if (i.sizeAmounts && size) {
            // Reset specific size amount
            const newSizeAmounts = { ...i.sizeAmounts };
            newSizeAmounts[size] = 0;
            return {
              ...i,
              sizeAmounts: newSizeAmounts,
              amount: Object.values(newSizeAmounts).reduce((sum, amount) => sum + amount, 0)
            };
          }
          return { ...i, amount: 0 };
        }
        return i;
      }));
    };

    if (mealItems.find(i => i.id === id)) {
      updateItemInArray(mealItems, setMealItems);
    } else if (foodItems.find(i => i.id === id)) {
      updateItemInArray(foodItems, setFoodItems);
    } else if (drinkItems.find(i => i.id === id)) {
      updateItemInArray(drinkItems, setDrinkItems);
    } else if (extraItems.find(i => i.id === id)) {
      updateItemInArray(extraItems, setExtraItems);
    }
  };

  // Modify getAllCartItems to handle sized items
  const getAllCartItems = () => {
    const allItems = [...mealItems, ...foodItems, ...drinkItems, ...extraItems];
    
    return allItems.reduce<Item[]>((acc, item) => {
      if (item.sizeAmounts) {
        // For items with sizes, create separate cart items for each size with amount > 0
        Object.entries(item.sizeAmounts).forEach(([size, amount]) => {
          if (amount > 0) {
            acc.push({
              ...item,
              selectedSize: size as SizeOption,
              amount: amount
            });
          }
        });
      } else if (item.amount > 0) {
        // For items without sizes
        acc.push(item);
      }
      return acc;
    }, []);
  };

  return (
    <div className="main-container order-selection-page">
      <nav className="tab-menu">
        <button
          className={`tab-item ${activeTab === "meal" ? "active" : ""}`}
          onClick={() => setActiveTab("meal")}
        >
          <i className="bi bi-fork-knife"></i> Mål
        </button>
        
        <button
          className={`tab-item ${activeTab === "food" ? "active" : ""}`}
          onClick={() => setActiveTab("food")}
        >
          <i className="bi bi-stack"></i> Burgare
        </button>

        <button
          className={`tab-item ${activeTab === "drink" ? "active" : ""}`}
          onClick={() => setActiveTab("drink")}
        >
          <i className="bi bi-cup-straw"></i> Dryck
        </button>

        <button
          className={`tab-item ${activeTab === "extra" ? "active" : ""}`}
          onClick={() => setActiveTab("extra")}
        >
          <i className="bi bi-plus-circle"></i> Tillbehör
        </button>
      </nav>

      <div className="tab-content">
        <div className="items-container">
          {(() => {
            switch (activeTab) {
              case "meal":
                return mealItems;
              case "food":
                return foodItems;
              case "drink":
                return drinkItems;
              case "extra":
                return extraItems;
              default:
                return [];
            }
          })().map((item) => (
            <div key={item.id} className={`item-card ${item.amount > 0 ? "selected" : ""}`}>
              <figure><img src={item.image} alt={item.name} className="item-image" /></figure>
              <h2 className="item-name">{item.name}</h2>
              {item.sizes && (
                <div className="size-selector">
                  {item.sizes.map((sizeObj) => (
                    <button
                      key={sizeObj.size}
                      className={`size-btn ${item.selectedSize === sizeObj.size ? "active" : ""}`}
                      onClick={() => handleSizeChange(item.id, sizeObj.size)}
                    >
                      {sizeObj.size}
                    </button>
                  ))}
                </div>
              )}
              
              <h3 className="item-price">{getItemPrice(item)} kr</h3>

              <div className="quantity-selector">
                <button
                  className="quantity-btn"
                  onClick={() => handleAmountChange(item.id, -1, item.selectedSize)}
                  disabled={item.amount <= 0}
                >
                  <i className="bi bi-dash-lg"></i>
                </button>

                <span className="quantity-value">
                  {item.sizeAmounts 
                    ? (item.sizeAmounts[item.selectedSize!] || 0)
                    : item.amount
                  }
                </span>

                <button
                  className="quantity-btn"
                  onClick={() => handleAmountChange(item.id, 1, item.selectedSize)}
                >
                  <i className="bi bi-plus-lg"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ShoppingCart 
        items={getAllCartItems()}
        onUpdateAmount={handleAmountChange}
        onRemoveItem={handleRemoveItem}
      />
    </div>
  );
}