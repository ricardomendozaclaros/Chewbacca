const TotalsCardComponent = ({ 
  data, 
  title, 
  subTitle, 
  description, 
  icon = "", 
  iconBgColor = "#f8f9fa", 
  unknown = false,
  format = 'number' // Possible values: 'number', 'string', 'percentage', 'ratio'
}) => {
  const formatValue = (value) => {
    if (unknown) return "?";
    if (!value && value !== 0) return "NA";

    switch (format) {
      case 'number':
        return typeof value === 'number' 
          ? value.toLocaleString('es-CO')
          : value;
      case 'percentage':
        return `${value}%`;
      case 'ratio':
        return value; // Already formatted as "X/Y"
      case 'string':
      default:
        return String(value);
    }
  };

  return (
    <div className="card info-card sales-card">
      <div className="px-2">
        <h5 className="card-title mb-2">
          {title} <span>{subTitle ? `| ${subTitle}` : ""}</span>
        </h5>

        <div className="d-flex align-items-center">
          {icon && (
            <div 
              className="card-icon rounded-circle d-flex align-items-center justify-content-center" 
              style={{ backgroundColor: iconBgColor }}
            >
              <i className={icon}></i>
            </div>
          )}
          <div className="ps-3">
            <h6>{formatValue(data)}</h6>
            {/* Optional trend indicator */}
            {!unknown && format !== 'ratio' && (
              <>
                <span className="text-success small pt-1 fw-bold">8%</span>
                <span className="text-muted small pt-2 ps-1">increase</span>
              </>
            )}
          </div>
        </div>
        <p className="card-text mt-2">{description}</p>
      </div>
    </div>
  );
};

export default TotalsCardComponent;
