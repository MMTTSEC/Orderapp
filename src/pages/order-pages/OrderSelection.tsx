// Order 2-3 from our mockup
import { useEffect, useMemo, useState } from "react";
import ShoppingCart from '../../components/ShoppingCart';
import OrderConfirmation from '../../components/OrderConfirmation';
import "../../styles/orderSelection.css";

OrderSelection.route = {
  path: '/order-selection'
};

type ActiveTab = "food" | "drink" | "extra";

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
  category?: string;
  productId?: string; // For items without sizes
};

type ProductQuantityResponse = {
  id: string;
  title: string;
  quantity?: number;
  price?: number;
  status?: boolean;
  product?: {
    id?: string;
    title?: string;
    category?: string;
    image?: {
      paths?: string[];
      mediaTexts?: string[];
    };
    price?: unknown;
  };
  size?: {
    id?: string;
    title?: string;
    portionSize?: string;
  };
};

export default function OrderSelection() {
   const [activeTab, setActiveTab] = useState<ActiveTab>("food");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [foodItems, setFoodItems] = useState<Item[]>([]);
  const [drinkItems, setDrinkItems] = useState<Item[]>([]);
  const [extraItems, setExtraItems] = useState<Item[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const sizeSynonyms: Record<string, string> = {
      stor: "Stor",
      large: "Stor",
      liten: "Liten",
      small: "Liten",
      mellan: "Mellan",
      medium: "Mellan",
      standard: "Standard",
      "no size": "Standard"
    };

    const normalizeSizeName = (value?: string | null) => {
      if (!value) return undefined;
      const trimmed = value.trim();
      if (!trimmed) return undefined;
      const lower = trimmed.toLowerCase();
      return sizeSynonyms[lower] ?? trimmed;
    };

    const mapCategoryToTab = (category?: string): ActiveTab => {
      const normalized = category?.toLowerCase() ?? "";
      if (["drink", "drinks", "beverage", "beverages"].includes(normalized)) return "drink";
      if (["side", "sides", "extra", "extras", "snack", "snacks"].includes(normalized)) return "extra";
      return "food";
    };

    const toSlug = (value: string) => value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'item';

    const coercePrice = (value: unknown): number => {
      if (typeof value === 'number' && Number.isFinite(value)) return value;
      if (value && typeof value === 'object') {
        const possible = (value as any).value ?? (value as any).Value;
        if (typeof possible === 'number' && Number.isFinite(possible)) return possible;
      }
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    };

    const getImageUrl = (paths?: string[]) => {
      if (!paths || paths.length === 0) return "/";
      const path = paths[0];
      if (!path) return "/";
      if (path.startsWith('http://') || path.startsWith('https://')) return path;
      if (path.startsWith('/')) return path;
      return `/media/${path}`;
    };

    const detectSizeFromSuffix = (name: string) => {
      let current = name.trim();
      let derivedSize: string | undefined;
      while (true) {
        const parts = current.split(/\s+/);
        if (parts.length <= 1) break;
        const last = parts[parts.length - 1];
        const normalized = normalizeSizeName(last);
        if (!normalized || normalized === "Standard") break;
        derivedSize = derivedSize ?? normalized;
        parts.pop();
        current = parts.join(' ').trim();
      }
      return {
        strippedName: current || name,
        derivedSize
      };
    };

    const extractBaseNameAndSize = (title: string, sizeTitle?: string | null) => {
      const initialName = title?.trim() ?? '';
      let sizeLabel = normalizeSizeName(sizeTitle);

      const suffixInfo = detectSizeFromSuffix(initialName);
      let baseName = suffixInfo.strippedName;
      if (!sizeLabel && suffixInfo.derivedSize) {
        sizeLabel = suffixInfo.derivedSize;
      }

      if (!baseName) baseName = title;
      if (sizeLabel === "Standard") sizeLabel = undefined;

      return { baseName, sizeLabel };
    };

    const ensureItem = (map: Map<string, Item>, key: string, baseName: string, category?: string) => {
      const existing = map.get(key);
      if (existing) {
        existing.name = baseName;
        if (category) existing.category = category;
        return existing;
      }

      const item: Item = {
        id: key,
        name: baseName,
        image: "/",
        amount: 0,
        price: 0,
        sizes: undefined,
        selectedSize: undefined,
        sizeAmounts: undefined,
        category
      };
      map.set(key, item);
      return item;
    };

    const addSizeOption = (item: Item, sizeLabel: string | undefined, price: number, productId?: string, productQuantityId?: string) => {
      if (!sizeLabel) {
        item.price = price;
        item.sizes = undefined;
        item.sizeAmounts = undefined;
        item.selectedSize = undefined;
        item.productId = productId; // Store productId for items without sizes
        return;
      }

      const sizes = item.sizes ?? [];
      const existingSize = sizes.find(s => s.size === sizeLabel);
      if (existingSize) {
        existingSize.price = price;
        existingSize.productId = existingSize.productId ?? productId;
        existingSize.productQuantityId = existingSize.productQuantityId ?? productQuantityId;
      } else {
        sizes.push({
          size: sizeLabel,
          price,
          productId,
          productQuantityId
        });
      }
      item.sizes = sizes;

      const sizeAmounts = item.sizeAmounts ?? {};
      if (sizeAmounts[sizeLabel] === undefined) {
        sizeAmounts[sizeLabel] = 0;
      }
      item.sizeAmounts = sizeAmounts;
      if (!item.selectedSize || sizeLabel.toLowerCase() === "liten") {
        item.selectedSize = sizeLabel;
      }
      item.price = undefined;
    };

    async function fetchProducts() {
      try {
        setLoadingProducts(true);
        setFetchError(null);

        const [productRes, quantityRes] = await Promise.all([
          fetch('/api/expand/Product', { headers: { 'Accept': 'application/json' } }),
          fetch('/api/expand/ProductQuantity', { headers: { 'Accept': 'application/json' } })
        ]);

        if (!productRes.ok || !quantityRes.ok) {
          throw new Error(`HTTP ${productRes.status}/${quantityRes.status}`);
        }

        const products: Array<{
          id: string;
          title?: string;
          category?: string;
          price?: unknown;
          image?: { paths?: string[]; mediaTexts?: string[] };
          size?: { id?: string; title?: string; portionSize?: string };
        }> = await productRes.json();

        const quantities: ProductQuantityResponse[] = await quantityRes.json();

        const itemsMap = new Map<string, Item>();

        products.forEach(prod => {
          if (!prod.id) return;
          const { baseName, sizeLabel } = extractBaseNameAndSize(prod.title ?? 'Produkt', prod.size?.title ?? prod.size?.portionSize);
          const category = prod.category ?? undefined;
          const baseKey = toSlug(baseName);
          const item = ensureItem(itemsMap, baseKey, baseName, category);

          const imgUrl = getImageUrl(prod.image?.paths);
          if (imgUrl !== "/" && (item.image === "/" || !item.image)) {
            item.image = imgUrl;
          }

          const price = coercePrice(prod.price);
          addSizeOption(item, sizeLabel, price, prod.id, undefined);
        });

        quantities.forEach(entry => {
          const productTitle = entry.product?.title ?? entry.title ?? 'Produkt';
          const category = entry.product?.category ?? undefined;
          const { baseName, sizeLabel } = extractBaseNameAndSize(productTitle, entry.size?.title ?? entry.size?.portionSize);
          const baseKey = toSlug(baseName);
          const item = ensureItem(itemsMap, baseKey, baseName, category);

          const imgUrl = getImageUrl(entry.product?.image?.paths);
          if (imgUrl !== "/" && (item.image === "/" || !item.image)) {
            item.image = imgUrl;
          }

          const price = coercePrice(entry.price ?? entry.product?.price);
          addSizeOption(item, sizeLabel, price, entry.product?.id, entry.id);
        });

        if (!isMounted) return;

        const baseItems = Array.from(itemsMap.values()).map(item => {
          if (item.sizes && item.sizes.length > 0) {
            const sizeAmounts = item.sizeAmounts ?? {};
            const preferredOrder = ["small", "medium", "large", "x-large", "xl", "xxl"];
            item.sizes.sort((a, b) => {
              const aIndex = preferredOrder.indexOf(a.size.toLowerCase());
              const bIndex = preferredOrder.indexOf(b.size.toLowerCase());
              if (aIndex === -1 && bIndex === -1) {
                return a.size.localeCompare(b.size);
              }
              if (aIndex === -1) return 1;
              if (bIndex === -1) return -1;
              return aIndex - bIndex;
            });

            item.sizes.forEach(size => {
              if (sizeAmounts[size.size] === undefined) sizeAmounts[size.size] = 0;
            });
            item.sizeAmounts = sizeAmounts;
            const smallOption = item.sizes.find(size => size.size.toLowerCase() === "liten");
            if (smallOption) {
              item.selectedSize = smallOption.size;
            } else {
              item.selectedSize = item.selectedSize ?? item.sizes[0].size;
            }
            item.price = undefined;
          } else {
            item.price = item.price ?? 0;
          }
          return item;
        });

        const nextFoods: Item[] = [];
        const nextDrinks: Item[] = [];
        const nextExtras: Item[] = [];

        baseItems.forEach(item => {
          const bucket = mapCategoryToTab(item.category);
          switch (bucket) {
            case "drink":
              nextDrinks.push(item);
              break;
            case "extra":
              nextExtras.push(item);
              break;
            case "food":
            default:
              nextFoods.push(item);
              break;
          }
        });

        setFoodItems(nextFoods);
        setDrinkItems(nextDrinks);
        setExtraItems(nextExtras);
      } catch (err) {
        if (!isMounted) return;
        console.error('Failed to fetch product data', err);
        setFetchError('Kunde inte hämta produkter just nu.');
      } finally {
        if (isMounted) setLoadingProducts(false);
      }
    }

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const tabs: ActiveTab[] = ["food", "drink", "extra"];
    const lookup: Record<ActiveTab, Item[]> = {
      food: foodItems,
      drink: drinkItems,
      extra: extraItems
    };
    const firstWithItems = tabs.find(tab => lookup[tab].length > 0);
    if (firstWithItems && lookup[activeTab].length === 0 && activeTab !== firstWithItems) {
      setActiveTab(firstWithItems);
    }
  }, [activeTab, foodItems, drinkItems, extraItems]);

  const currentItems = useMemo(() => {
    switch (activeTab) {
      case "food":
        return foodItems;
      case "drink":
        return drinkItems;
      case "extra":
        return extraItems;
      default:
        return [];
    }
  }, [activeTab, foodItems, drinkItems, extraItems]);

  const handleAmountChange = (id: string, delta: number, size?: SizeOption) => {
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

    if (foodItems.find(i => i.id === id)) {
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

  const handleSizeChange = (id: string, size: SizeOption) => {
    const updateItemInArray = (setItems: React.Dispatch<React.SetStateAction<Item[]>>) => {
      setItems(prev => prev.map(i => 
        i.id === id ? { ...i, selectedSize: size } : i
      ));
    };

    if (foodItems.find(i => i.id === id)) {
      updateItemInArray(setFoodItems);
    } else if (drinkItems.find(i => i.id === id)) {
      updateItemInArray(setDrinkItems);
    } else if (extraItems.find(i => i.id === id)) {
      updateItemInArray(setExtraItems);
    }
  };

  const handleRemoveItem = (id: string, size?: SizeOption) => {
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

    if (foodItems.find(i => i.id === id)) {
      updateItemInArray(foodItems, setFoodItems);
    } else if (drinkItems.find(i => i.id === id)) {
      updateItemInArray(drinkItems, setDrinkItems);
    } else if (extraItems.find(i => i.id === id)) {
      updateItemInArray(extraItems, setExtraItems);
    }
  };

  // Modify getAllCartItems to handle sized items
  const getAllCartItems = () => {
    const allItems = [...foodItems, ...drinkItems, ...extraItems];
    
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
          className={`tab-item ${activeTab === "food" ? "active" : ""}`}
          onClick={() => setActiveTab("food")}
        >
          <i className="bi bi-fork-knife"></i> Mat
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
          {loadingProducts ? (
            <div className="items-feedback">Laddar produkter...</div>
          ) : fetchError ? (
            <div className="items-feedback error">{fetchError}</div>
          ) : currentItems.length === 0 ? (
            <div className="items-feedback">Inga produkter tillgängliga i denna kategori.</div>
          ) : currentItems.map((item) => (
            <div key={item.id} className={`item-card ${item.amount > 0 ? "selected" : ""}`}>
              <figure><img src={item.image} alt={item.name} className="item-image" /></figure>
              <h2 className="item-name">{item.name}</h2>
              {item.sizes && item.sizes.length > 0 && (
                <div className="size-selector">
                  <label htmlFor={`size-${item.id}`} className="visually-hidden">Storlek</label>
                  <select
                    id={`size-${item.id}`}
                    className="size-dropdown"
                    value={item.selectedSize}
                    onChange={(e) => handleSizeChange(item.id, e.target.value)}
                  >
                    {item.sizes.map((sizeObj) => (
                      <option key={sizeObj.size} value={sizeObj.size}>
                        {sizeObj.size}
                      </option>
                    ))}
                  </select>
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
        onConfirm={() => setShowConfirmation(true)}
      />

     {showConfirmation && (
       <OrderConfirmation
         items={getAllCartItems()}
         onClose={() => setShowConfirmation(false)}
       />
     )}
    </div>
  );
}