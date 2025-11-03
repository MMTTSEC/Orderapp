import { useNavigate } from "react-router-dom";

OrderIndex.route = {
  path: '/'
};

export default function OrderIndex() {
  const navigate = useNavigate();
  const goToOrderSelection = () => {
    navigate("/order-selection");
  };

  return <>
    <div className="main-container order-index-page">
      <button className="btn-left" onClick={goToOrderSelection}><i className="bi bi-fork-knife"></i>PÅ PLATS</button>
      <button className="btn-right" onClick={goToOrderSelection}><i className="bi bi-bag-fill"></i>TA MED</button>
    </div>
  </>
}