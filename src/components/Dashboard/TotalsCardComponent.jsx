const TotalsCardComponent = ({data, title, subTitle, description}) => {
  return (
      <div className="card info-card sales-card" style={{ width: "100%", height: "100%" }}>
        <div className="card-body">
          <h5 className="card-title">
            {title} <span> | {subTitle} </span>
          </h5>

          <div className="d-flex align-items-center">
            <div className="text-center" style={{ width: "100%" }}>
              <h6 
                className="h3" 
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "100%"
                }}
              >
                {data | 'NA'}
              </h6>
            </div>
          </div>
        </div>
      </div>
  );
};

export default TotalsCardComponent;
