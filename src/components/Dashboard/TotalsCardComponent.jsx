const TotalsCardComponent = ({ data, title, subTitle, description, icon = "" }) => {
  return (
    <div className="card info-card sales-card">
      <div className="px-2">
        <h5 className="card-title mb-2">
          {title} <span> {subTitle ? `| ${subTitle}` : ""} </span>
        </h5>

        <div className="d-flex align-items-center">
          {icon && icon !== "" && (
            <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
              <i className={icon}></i>
            </div>
          )}
          <div className="ps-3">
            <h6>{data | "NA"}</h6>
            <span className="text-success small pt-1 fw-bold">8%</span>{" "}
            <span className="text-muted small pt-2 ps-1">increase</span>
          </div>
        </div>
        <p className="card-text mt-2">{description}</p>
      </div>
    </div>
  );
};

export default TotalsCardComponent;
