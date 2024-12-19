
const TotalsCardComponent = ({title}) => {
  return (
    <>
      <div className="card info-card sales-card" style={{ width: "100%", height: "100%" }}>

        <div className="card-body">
          <h5 className="card-title">
            {title}
          </h5>

          <div className="d-flex align-items-center">
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
