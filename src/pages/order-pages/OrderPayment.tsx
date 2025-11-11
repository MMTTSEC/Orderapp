// src/pages/order-pages/OrderPayment.tsx
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BsCreditCard2Front, BsPaypal, BsBank, BsPhoneFill } from "react-icons/bs";
import "../../styles/orderPayment.css";

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
  productId?: string;
};

OrderPayment.route = {
  path: '/order-payment'
};
export default function OrderPayment() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState("swish");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const items: Item[] = (location.state?.items as Item[]) || [];

  const handlePayment = async () => {
    if (items.length === 0) {
      alert("Inga produkter i beställningen.");
      return;
    }

    setIsSubmitting(true);
    try {
      const ordersRes = await fetch('/api/raw/CustomerOrder', {
        headers: { 'Accept': 'application/json' }
      });
      
      if (!ordersRes.ok) {
        throw new Error(`Failed to fetch orders: ${ordersRes.status}`);
      }

      const existingOrders = await ordersRes.json();
      const orderCount = Array.isArray(existingOrders) ? existingOrders.length : 0;
      const nextOrderNumber = (orderCount + 1).toString();

      const productQuantityIds: string[] = [];
      
      for (const item of items) {
        let productId: string | undefined;
        
        if (item.sizes && item.selectedSize) {
          const selectedSizeData = item.sizes.find(s => s.size === item.selectedSize);
          productId = selectedSizeData?.productId;
        } else if (item.price !== undefined) {
          productId = item.productId;
        }

        if (!productId) {
          continue;
        }

        const sanitizeTitle = (str: string) => str
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') || 'item';
        
        const productQuantityTitle = sanitizeTitle(item.name);
        
        const productQuantityPayload = {
          title: productQuantityTitle,
          productId: productId,
          quantity: item.amount,
          status: false
        };

        const productQuantityRes = await fetch('/api/ProductQuantity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(productQuantityPayload)
        });

        if (!productQuantityRes.ok) {
          const errorText = await productQuantityRes.text();
          throw new Error(`Failed to create ProductQuantity for ${item.name}: ${productQuantityRes.status} - ${errorText}`);
        }

        const createdProductQuantity = await productQuantityRes.json();
        
        let productQuantityId = createdProductQuantity.id || 
                                createdProductQuantity.ContentItemId ||
                                (createdProductQuantity.value && createdProductQuantity.value[0]?.ContentItemId) ||
                                (Array.isArray(createdProductQuantity) && createdProductQuantity[0]?.ContentItemId);
        
        if (!productQuantityId) {
          throw new Error(`Failed to get ProductQuantity ID for ${item.name}. Response: ${JSON.stringify(createdProductQuantity)}`);
        }

        productQuantityIds.push(productQuantityId);
      }

      if (productQuantityIds.length === 0) {
        throw new Error("Inga produkter med giltiga ID:n hittades.");
      }

      // Current time in Sweden (Europe/Stockholm) as ISO 8601 with proper offset
      const now = new Date();
      const parts = new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'Europe/Stockholm',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).formatToParts(now);

      const get = (type: Intl.DateTimeFormatPartTypes) => (parts.find(p => p.type === type)?.value || '').padStart(2, '0');
      const yyyy = get('year');
      const MM = get('month');
      const dd = get('day');
      const HH = get('hour');
      const mm = get('minute');
      const ss = get('second');

      let offset = 'Z';
      try {
        const tzParts = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Europe/Stockholm',
          hour: '2-digit',
          timeZoneName: 'shortOffset'
        }).formatToParts(now);
        const tzName = tzParts.find(p => p.type === 'timeZoneName')?.value || '';
        const match = tzName.match(/GMT([+-]\d{1,2})/);
        if (match) {
          const sign = match[1][0];
          const hours = match[1].slice(1).padStart(2, '0');
          const mins = '00';
          offset = `${sign}${hours}:${mins}`;
        }
      } catch {}

      const orderPlacedAt = `${yyyy}-${MM}-${dd}T${HH}:${mm}:${ss}${offset}`;

      const flatProductQuantityIds = productQuantityIds.filter(id => id && typeof id === 'string');
      
      if (flatProductQuantityIds.length === 0) {
        throw new Error("Inga giltiga ProductQuantity ID:n att lägga till i beställningen.");
      }

      const orderPayload = {
        title: nextOrderNumber,
        orderPlacedAt: orderPlacedAt,
        product: flatProductQuantityIds
      };

      const createRes = await fetch('/api/CustomerOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(orderPayload)
      });

      if (!createRes.ok) {
        const errorText = await createRes.text();
        throw new Error(`Failed to create order: ${createRes.status} - ${errorText}`);
      }

      navigate('/order-receipt', { 
        state: { 
          orderNumber: nextOrderNumber,
          items: items
        } 
      });
    } catch (error) {
      alert(`Kunde inte skapa beställningen: ${error instanceof Error ? error.message : 'Okänt fel'}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="main-container order-payment-page">
      <div className="payment-content">
        <h1>Välj Betalningsmetod</h1>

        <div className="patment-options">
          {/* Swish */}
          <div
            className={`payment-option ${selectedMethod === "swish" ? "selected" : ""}`}
            onClick={() => setSelectedMethod("swish")}
            role="button"
          >
            <label className="payment-label">
              <input
                type="radio"
                name="payment-method"
                checked={selectedMethod === "swish"}
                onChange={() => setSelectedMethod("swish")}
              />
              <span className="payment-label-text">Swish</span>
            </label>
            <BsPhoneFill className="icon swish" />
          </div>

          {/* Card */}
          <div
            className={`payment-option ${selectedMethod === "card" ? "selected" : ""}`}
            onClick={() => setSelectedMethod("card")}
            role="button"
          >
            <label className="payment-label">
              <input
                type="radio"
                name="payment-method"
                checked={selectedMethod === "card"}
                onChange={() => setSelectedMethod("card")}
              />
              <span className="payment-label-text">Add card</span>
            </label>
            <BsCreditCard2Front className="icon card" />
          </div>

          {/* PayPal */}
          <div
            className={`payment-option ${selectedMethod === "paypal" ? "selected" : ""}`}
            onClick={() => setSelectedMethod("paypal")}
            role="button"
          >
            <label className="payment-label">
              <input
                type="radio"
                name="payment-method"
                checked={selectedMethod === "paypal"}
                onChange={() => setSelectedMethod("paypal")}
              />
              <span className="payment-label-text">PayPal</span>
            </label>
            <BsPaypal className="icon paypal" />
          </div>

          {/* Klarna */}
          <div
            className={`payment-option ${selectedMethod === "klarna" ? "selected" : ""}`}
            onClick={() => setSelectedMethod("klarna")}
            role="button"
          >
            <label className="payment-label">
              <input
                type="radio"
                name="payment-method"
                checked={selectedMethod === "klarna"}
                onChange={() => setSelectedMethod("klarna")}
              />
              <span className="payment-label-text">Klarna</span>
            </label>
            <BsBank className="icon klarna" />
          </div>
        </div>

        {/* Pay Button */}
        <button
          type="button"
          className="pay-button"
          onClick={handlePayment}
          disabled={isSubmitting || items.length === 0}
        >
          {isSubmitting ? "Skapar order..." : "Betala"}
        </button>
      </div>
    </div>
  );
}


