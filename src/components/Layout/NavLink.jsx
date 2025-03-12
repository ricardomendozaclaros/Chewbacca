import { Link } from "react-router-dom";

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
  // Generar un ID seguro basado en el nombre
  const safeId = name.toLowerCase().replace(/[^a-z0-9]/g, '-');

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
            data-bs-target={`#nav-${safeId}`}
            data-bs-toggle="collapse"
            href="#"
            onClick={handleClick}
          >
            <i className={logo}></i>
            <span>{name}</span>
            <i className="bi bi-chevron-down ms-auto"></i>
          </a>
          <ul
            id={`nav-${safeId}`}
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