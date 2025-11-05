// src/pages/order-pages/OrderPayment.tsx
import { useState } from "react";
import { BsArrowLeft, BsCreditCard2Front, BsPaypal, BsBank, BsPhoneFill } from "react-icons/bs";
import "bootstrap/dist/css/bootstrap.min.css";
OrderPayment.route = {
  path: '/order-payment'
};
export default function OrderPayment() {
  const [selectedMethod, setSelectedMethod] = useState("swish");

  return (
    <div className="container py-4">
      <div className="mx-auto bg-light p-4 rounded-4 shadow-sm w-100" style={{ maxWidth: "480px", minHeight: "480px" }}>
        <div className="d-flex align-items-center mb-4">
          <BsArrowLeft size={24} className="me-2" />
          <span className="text-muted">Order 5</span>
        </div>

        <div
          className="border rounded-3 p-3"
          style={{
            backgroundColor: "#fff",
            borderColor: "#ccc",
          }}
        >
          {/* Swish */}
          <div
            className={`d-flex justify-content-between align-items-center p-2 mb-2 rounded ${
              selectedMethod === "swish" ? "border border-success" : "border"
            }`}
            onClick={() => setSelectedMethod("swish")}
            style={{ cursor: "pointer" }}
          >
            <div className="form-check">
              <input
                type="radio"
                className="form-check-input"
                name="payment-method"
                checked={selectedMethod === "swish"}
                onChange={() => setSelectedMethod("swish")}
              />
              <label className="form-check-label fw-semibold">Swish</label>
            </div>
            <BsPhoneFill className="text-success fs-5" />
          </div>

          {/* Card */}
          <div
            className={`d-flex justify-content-between align-items-center p-2 mb-2 rounded ${
              selectedMethod === "card" ? "border border-success" : "border"
            }`}
            onClick={() => setSelectedMethod("card")}
            style={{ cursor: "pointer" }}
          >
            <div className="form-check">
              <input
                type="radio"
                className="form-check-input"
                name="payment-method"
                checked={selectedMethod === "card"}
                onChange={() => setSelectedMethod("card")}
              />
              <label className="form-check-label fw-semibold">Add card</label>
            </div>
            <BsCreditCard2Front className="text-primary fs-5" />
          </div>

          {/* PayPal */}
          <div
            className={`d-flex justify-content-between align-items-center p-2 mb-2 rounded ${
              selectedMethod === "paypal" ? "border border-success" : "border"
            }`}
            onClick={() => setSelectedMethod("paypal")}
            style={{ cursor: "pointer" }}
          >
            <div className="form-check">
              <input
                type="radio"
                className="form-check-input"
                name="payment-method"
                checked={selectedMethod === "paypal"}
                onChange={() => setSelectedMethod("paypal")}
              />
              <label className="form-check-label fw-semibold">PayPal</label>
            </div>
            <BsPaypal className="text-primary fs-4" />
          </div>

          {/* Klarna */}
          <div
            className={`d-flex justify-content-between align-items-center p-2 mb-2 rounded ${
              selectedMethod === "klarna" ? "border border-success" : "border"
            }`}
            onClick={() => setSelectedMethod("klarna")}
            style={{ cursor: "pointer" }}
          >
            <div className="form-check">
              <input
                type="radio"
                className="form-check-input"
                name="payment-method"
                checked={selectedMethod === "klarna"}
                onChange={() => setSelectedMethod("klarna")}
              />
              <label className="form-check-label fw-semibold">Klarna</label>
            </div>
            <BsBank className="text-danger fs-4" />
          </div>
        </div>

        {/* Pay Button */}
        <button
          className="btn btn-success w-100 mt-4 py-2 fw-semibold"
          style={{ borderRadius: "10px" }}
        >
          Pay
        </button>
      </div>
    </div>
  );
}


