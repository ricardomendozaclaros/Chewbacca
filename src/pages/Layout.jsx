import { useState } from "react";
import { Outlet } from "react-router-dom";
import HeaderBar from "../components/Layout/HeaderBar";
import SideBar from "../components/Layout/SideBar";

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <div className={`app ${isSidebarOpen ? "" : "toggle-sidebar"}`}>
      <HeaderBar toggleSidebar={toggleSidebar} />
      <SideBar />
      <main id="main" className="main">
        <Outlet />
      </main>
    </div>
  );
}

