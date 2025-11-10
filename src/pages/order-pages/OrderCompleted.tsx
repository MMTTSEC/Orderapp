// Order 7 from our mockup
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../../styles/orderCompleted.css';
OrderCompleted.route = {
  path: '/order-completed'
};

export default function OrderCompleted() {
  const location = useLocation();
  const orderNumber = (location.state as any)?.orderNumber || 'N/A';
  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = "/";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return <>
    <div className="order-completed-page">
      <h1 className="oc-title">Beställning slutförd!</h1>

      <div className="oc-center">
        <h2 className="oc-subtitle">Ditt nummer:</h2>
        <div className="oc-number-badge">
          <span className="oc-number"># {orderNumber}</span>
        </div>
      </div>

      <div className="oc-bottom">
        <button
          type="button"
          className="btn oc-home-btn"
          onClick={() => { window.location.href = "/"; }}
        >
          Till startsidan ({secondsLeft})
        </button>
      </div>
    </div>
  </>
}