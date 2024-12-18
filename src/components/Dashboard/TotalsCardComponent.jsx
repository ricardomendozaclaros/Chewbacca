
const TotalsCardComponent = ({title}) => {
  return (
    <>
      <div className="card info-card sales-card">
        <div className="filter">
          <a className="icon" href="#" data-bs-toggle="dropdown">
            <i className="bi bi-three-dots"></i>
          </a>
          <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
            <li className="dropdown-header text-start">
              <h6>Filter</h6>
            </li>

            <li>
              <a className="dropdown-item" href="#">
                Today
              </a>
            </li>
            <li>
              <a className="dropdown-item" href="#">
                This Month
              </a>
            </li>
            <li>
              <a className="dropdown-item" href="#">
                This Year
              </a>
            </li>
          </ul>
        </div>

        <div className="card-body">
          <h5 className="card-title">
            {title}
          </h5>

          <div className="d-flex align-items-center">
            {/* <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
              <i className="bi bi-cart"></i>
            </div> */}
            <div className="pt-3">
              <h6>30000</h6>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TotalsCardComponent;
