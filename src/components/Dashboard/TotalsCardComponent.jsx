const TotalsCardComponent = ({ data, title, subTitle, description }) => {
  return (
    <div
      className="card info-card sales-card"
      style={{ width: "100%", height: "100%" }}
    >
      <div className="card-body">
        <h5 className="card-title">
          {title} <span> | {subTitle} </span>
        </h5>

        <div className="d-flex align-items-center">
          <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
            <i className="bi bi-currency-dollar"></i>
          </div>
          <div className="ps-3">
            <h6>{data | "NA"}</h6>
            <span className="text-success small pt-1 fw-bold">8%</span>{" "}
            <span className="text-muted small pt-2 ps-1">increase</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalsCardComponent;
