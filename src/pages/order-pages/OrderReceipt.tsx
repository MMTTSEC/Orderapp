// Order 5 from our mockup
import { useLocation, useNavigate } from "react-router-dom";
import '../../styles/orderReceipt.css';

OrderReceipt.route = {
  path: '/order-receipt'
};

export default function OrderReceipt() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderNumber = (location.state as any)?.orderNumber;
  
  const goToOrderCompleted = () => {
    navigate("/order-completed", { state: { orderNumber } });
  };

   return <>
    <div className="main-container order-receipt-page">
      <button className="btn-left" onClick={goToOrderCompleted}><i className="bi bi-receipt"></i>KVITTO</button>
      <button className="btn-right" onClick={goToOrderCompleted}><i className="bi bi-leaf-fill"></i>INGET KVITTO</button>
    </div>
  </>
}