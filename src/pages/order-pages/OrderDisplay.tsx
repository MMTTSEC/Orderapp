// Previous Index of our mockup, it's the individual page for displaying finished and in progress orders.
import '../../styles/orderdisplay.css';

OrderDisplay.route = {
  path: '/order-display'
};

export default function OrderDisplay() {
  const inProgressOrders = [3110, 3111, 3112, 3113, 3114];
  const finishedOrders = [3108, 3109];

  return <>
    <div className="order-display-container">
      <section className="orders-section">
        <h2>Pågående beställningar</h2>
        <div className="orders-board">
          {inProgressOrders.map((num) => (
            <div
              key={num}
              className={`order-chip ${num === 3112 ? 'order-chip--highlight' : ''}`}
            >
              #{num}
            </div>
          ))}
        </div>
      </section>

      <section className="orders-section">
        <h2>Färdiga beställningar</h2>
        <div className="orders-board">
          {finishedOrders.map((num) => (
            <div key={num} className="order-chip order-chip--done">#{num}</div>
          ))}
        </div>
      </section>
    </div>
  </>
}