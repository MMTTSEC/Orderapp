// src/pages/order-pages/OrderPayment.tsx
import { useState } from "react";
import { BsCreditCard2Front, BsPaypal, BsBank, BsPhoneFill } from "react-icons/bs";
import "../../styles/orderPayment.css";

OrderPayment.route = {
  path: '/order-payment'
};
export default function OrderPayment() {
  const [selectedMethod, setSelectedMethod] = useState("swish");

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
          onClick={() => { window.location.href = "/order-receipt"; }}
        >
          Betala
        </button>
      </div>
    </div>
  );
}


