import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { logout } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import "../styles/AdminLayout.css";
import { useState } from "react";

import {
  LayoutDashboard,
  BookOpen,
  FileUser,
  Building2,
  FileAxis3d,
  ListChecks,
  RotateCwFadingClock,
  ChartCandlestick,
  Summary,
  ListCheck,
  Users,
  Settings,
  Menu,
} from "lucide-react";

// Importing the logo image
import hero from "../assets/hero.png";

function AdminLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State to manage the sidebar's open/closed state
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Toggle the sidebar open/closed state
  const toggleSidebar = () => {
    setSidebarOpen((previous) => !previous);
  };
  // Close the sidebar on mobile devices when a link is clicked
  const closeSidebarOnMobile = () => {
    if (window.innerWidth <= 700) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div
      // Apply different classes based on the sidebar's state
      className={`admin-layout ${
        sidebarOpen ? "sidebar-open" : "sidebar-closed"
      }`}
    >
      {/* HEADER */}
      <header className="admin-header">
        <div className="admin-header-left">
          {/* Sidebar Toggle */}
          <button
            type="button" //type attribute specifies the button's behavior
            className="sidebar-toggle" //className attribute assigns a CSS class for styling
            onClick={toggleSidebar} //onClick attribute specifies the function to be called when the button is clicked
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"} //aria-label attribute provides an accessible label for screen readers
            title={sidebarOpen ? "Close sidebar" : "Open sidebar"} //title attribute provides a tooltip when hovering over the button
          >
            <Menu size={22} />
          </button>

          {/* Application Title */}
          <div className="admin-title">
            <img src={hero} alt="Jang Printz" className="admin-logo" />
            <h2>Jang Printz</h2>
          </div>
        </div>

        {/* Admin User */}
        <div className="admin-user">
          <span title={`${user?.firstName} ${user?.lastName}`}>
            {user?.firstName} {user?.lastName}
          </span>

          <button type="button" className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="admin-body">
        <aside className="sidebar">
          {/* MAIN */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">MAIN</div>

          <NavLink
            to="/admin"
            end
            onClick={closeSidebarOnMobile}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
            title="Dashboard"
          >
            <span className="nav-icon">
                <LayoutDashboard size={18} />
              </span>

              <span className="nav-text">Dashboard</span>
            </NavLink>
          </div>

          {/* APPLICATION */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">APPLICATION</div>

          <NavLink
            to="/admin/application"
            end
            onClick={closeSidebarOnMobile}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
            title="Application"
          >
            <span className="nav-icon">
                <BookOpen size={18} />
              </span>

              <span className="nav-text">Application</span>
            </NavLink>
          </div>

          
        </aside>
                {/* MOBILE OVERLAY - this overlay is displayed on mobile devices when the sidebar is open. Clicking on it will close the sidebar. */}
        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={toggleSidebar} />
        )}

        {/* MAIN CONTENT - this is where the main content of the admin dashboard will be rendered. The Outlet component is used to render the matched child route components.*/}
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;



