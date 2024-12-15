import { useState } from "react";
import NavLink from "./NavLink";
import { OptionsNav } from "../../utils/routes";


export default function SideBar() {

  const [activeNav, setActiveNav] = useState("");
  const [activeSubNav, setActiveSubNav] = useState("");

  return (
    <>
      <aside id="sidebar" className="sidebar">
        <ul className="sidebar-nav" id="sidebar-nav">
          {OptionsNav.map((option) => (
            <NavLink
            key={option.name}
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
          ))}     
        </ul>
      </aside>
    </>
  );
}
