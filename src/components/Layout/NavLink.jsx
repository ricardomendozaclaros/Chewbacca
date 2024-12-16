import { Link } from "react-router-dom";
import PropTypes from "prop-types";

export default function NavLink({
  name,
  isSublist,
  to,
  sublist,
  logo,
  isActive,
  setActiveNav,
  activeSubNav,
  setActiveSubNav,
}) {
  const handleClick = () => {
    setActiveNav(name);
  };

  const handleSubClick = (subName) => {
    setActiveSubNav(subName);
  };

  return (
    <>
      {!isSublist ? (
        <li className="nav-item">
          <Link
            className={`nav-link ${isActive ? "" : "collapsed"}`}
            to={to}
            onClick={handleClick}
          >
            <i className={logo}></i>
            <span>{name}</span>
          </Link>
        </li>
      ) : (
        <li className="nav-item">
          <a
            className={`nav-link ${isActive ? "" : "collapsed"}`}
            data-bs-target={`#${name}-nav`}
            data-bs-toggle="collapse"
            href="#"
            onClick={handleClick}
          >
            <i className={logo}></i>
            <span>{name}</span>
            <i className="bi bi-chevron-down ms-auto"></i>
          </a>
          <ul
            id={`${name}-nav`}
            className={`nav-content collapse ${isActive ? "show" : ""}`}
            data-bs-parent="#sidebar-nav"
          >
            {sublist.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.to}
                  className={`${activeSubNav === item.name ? "active" : ""}`}
                  onClick={() => handleSubClick(item.name)}
                >
                  <i className="bi bi-circle"></i>
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </li>
      )}
    </>
  );
}

NavLink.propTypes = {
  name: PropTypes.string.isRequired,
  isSublist: PropTypes.bool,
  to: PropTypes.string,
  sublist: PropTypes.arrayOf(
    PropTypes.shape({
      to: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
  logo: PropTypes.string,
  isActive: PropTypes.bool.isRequired,
  setActiveNav: PropTypes.func.isRequired,
  activeSubNav: PropTypes.string.isRequired,
  setActiveSubNav: PropTypes.func.isRequired,
};