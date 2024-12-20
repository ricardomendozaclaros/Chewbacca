import { useState } from "react";
import NavLink from "./NavLink";
import { useAuth } from "../../hooks/useAuth";

export default function SideBar() {
  const [activeNav, setActiveNav] = useState("");
  const [activeSubNav, setActiveSubNav] = useState("");
  const { menuItems } = useAuth();
 

  return (
    
    <aside id="sidebar" className="sidebar">
      <img src="/src/resources/image/logo.jpeg" alt="" width={250}/>
      <ul className="sidebar-nav" id="sidebar-nav">
        {menuItems && menuItems.map((option) => (
          !option.isSeperador ? (
            <NavLink
              key={option.name || option.to}
              name={option.name}
              isSublist={option.isSublist}
              to={option.to}
              sublist={option.sublist}
              logo={option.logo}
              isActive={activeNav === option.name}
              setActiveNav={setActiveNav}
              activeSubNav={activeSubNav}
              setActiveSubNav={setActiveSubNav}
            />
          ) : (
            <div key={option.Separado} className="nav-heading">
              {option.Separado}
            </div>
          )
        ))}
      </ul>
    </aside>
  );
}