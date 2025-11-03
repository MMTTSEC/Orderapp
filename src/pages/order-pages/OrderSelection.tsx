// Order 2-3 from our mockup
import { useState } from "react";
import "../../styles/orderSelection.css";

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
};

export default function OrderSelection() {
   const [activeTab, setActiveTab] = useState<"meal" | "food" | "drink" | "extra">("food");

  // Example data
const [mealItems, setMealItems] = useState<Item[]>([
    { id: 1, name: "Mål 1", image: "/", amount: 0, price: 100 },
    { id: 2, name: "Mål 2", image: "/", amount: 0, price: 115 },
    { id: 3, name: "Mål 3", image: "/", amount: 0, price: 105 }
  ]);

  const [foodItems, setFoodItems] = useState<Item[]>([
    { id: 1, name: "Burgare 1", image: "/", amount: 0, price: 80 },
    { id: 2, name: "Burgare 2", image: "/", amount: 0, price: 80 },
    { id: 3, name: "Burgare 3", image: "/", amount: 0, price: 80 },
    { id: 4, name: "Burgare 4", image: "/", amount: 0, price: 70 },
    { id: 5, name: "Burgare 5", image: "/", amount: 0, price: 70 },
    { id: 6, name: "Burgare 6", image: "/", amount: 0, price: 35 },
    { id: 7, name: "Burgare 7", image: "/", amount: 0, price: 30 },
    { id: 8, name: "Burgare 8", image: "/", amount: 0, price: 24 },
    { id: 9, name: "Burgare 9", image: "/", amount: 0, price: 24 }
  ]);

  const [drinkItems, setDrinkItems] = useState<Item[]>([
    { id: 1, name: "Cola", image: "/", amount: 0, sizes: [{ size: "Liten", price: 20 },{ size: "Mellan", price: 25 },{ size: "Stor", price: 30 }], selectedSize: "Mellan" },
    { id: 2, name: "Cola Zero", image: "/", amount: 0, sizes: [{ size: "Liten", price: 20 },{ size: "Mellan", price: 25 },{ size: "Stor", price: 30 }], selectedSize: "Mellan" },
    { id: 3, name: "Fanta", image: "/", amount: 0, sizes: [{ size: "Liten", price: 20 },{ size: "Mellan", price: 25 },{ size: "Stor", price: 30 }], selectedSize: "Mellan" },
    { id: 4, name: "Fanta Zero", image: "/", amount: 0, sizes: [{ size: "Liten", price: 20 },{ size: "Mellan", price: 25 },{ size: "Stor", price: 30 }], selectedSize: "Mellan" },
    { id: 5, name: "Sprite", image: "/", amount: 0, sizes: [{ size: "Liten", price: 20 },{ size: "Mellan", price: 25 },{ size: "Stor", price: 30 }], selectedSize: "Mellan" },
    { id: 6, name: "Sprite Zero", image: "/", amount: 0, sizes: [{ size: "Liten", price: 20 },{ size: "Mellan", price: 25 },{ size: "Stor", price: 30 }], selectedSize: "Mellan" },
    { id: 7, name: "Vatten", image: "/", amount: 0, sizes: [{ size: "Liten", price: 20 },{ size: "Mellan", price: 25 },{ size: "Stor", price: 30 }], selectedSize: "Mellan" }
  ]);

  const [extraItems, setExtraItems] = useState<Item[]>([
    { id: 1, name: "Pommes", image: "/", amount: 0, sizes: [{ size: "Liten", price: 15 },{ size: "Mellan", price: 25 },{ size: "Stor", price: 35 }], selectedSize: "Mellan" },
    { id: 2, name: "Ketchup", image: "/", amount: 0, price: 5 },
    { id: 3, name: "Senap", image: "/", amount: 0, price: 5 },
    { id: 4, name: "Dressing", image: "/", amount: 0, price: 10 },
    { id: 5, name: "Sallad", image: "/", amount: 0, sizes: [{ size: "Liten", price: 15 },{ size: "Mellan", price: 25 },{ size: "Stor", price: 35 }], selectedSize: "Mellan" }
  ]);

  const getItems = () => {
    switch (activeTab) {
      case "meal":
        return [mealItems, setMealItems] as const;
      case "food":
        return [foodItems, setFoodItems] as const;
      case "drink":
        return [drinkItems, setDrinkItems] as const;
      case "extra":
        return [extraItems, setExtraItems] as const;
    }
  };

  const [items, setItems] = getItems();

  const handleAmountChange = (id: number, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, amount: Math.max(0, item.amount + delta) }
          : item
      )
    );
  };

  const getItemPrice = (item: Item): number => {
    if (item.sizes) {
      const selected = item.sizes.find((s) => s.size === item.selectedSize);
      return selected ? selected.price : item.sizes[0].price;
    }
    return item.price ?? 0;
  };

  const handleSizeChange = (id: number, size: SizeOption) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selectedSize: size } : item
      )
    );
  };
  
  return (
    <div className=" main-container order-selection-page">
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
          {items.map((item) => (
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
                  onClick={() => handleAmountChange(item.id, -1)}
                  disabled={item.amount <= 0}
                >
                  <i className="bi bi-dash-lg"></i>
                </button>

                <span className="quantity-value">{item.amount}</span>

                <button
                  className="quantity-btn"
                  onClick={() => handleAmountChange(item.id, +1)}
                >
                  <i className="bi bi-plus-lg"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}