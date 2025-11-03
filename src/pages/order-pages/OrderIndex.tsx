OrderIndex.route = {
  path: '/'
};

export default function OrderIndex() {

  return <>
    <div className="main-container order-index-page">
      <button className="btn-left"><i className="bi bi-fork-knife"></i>PÅ PLATS</button>
      <button className="btn-right"><i className="bi bi-bag-fill"></i>TA MED</button>
    </div>
  </>
}