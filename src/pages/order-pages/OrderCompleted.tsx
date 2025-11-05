// Order 7 from our mockup
import '../../styles/orderCompleted.css';
OrderCompleted.route = {
  path: '/order-completed'
};

export default function OrderCompleted() {
  const orderNumber = 3112;

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
          Till startsidan
        </button>
      </div>
    </div>
  </>
}