import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { logout } from "../services/authService";
import { useAuth } from "../context/useAuth";
import "../styles/AdminLayout.css";
import { useState } from "react";

import {
  LayoutDashboard,
  BookOpen,
  FileUser,
  Handshake,
  FileAxis3d,
  ListChecks,
  BookOpenCheck,
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
            <img src={hero} alt="OJT Monitoring System LCCI" className="admin-logo" />
            <h2>OJT Monitoring System LCCI</h2>
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
                <FileUser size={18} />
              </span>

              <span className="nav-text">Application</span>
            </NavLink>

            <NavLink
            to="/admin/students"
            end
            onClick={closeSidebarOnMobile}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
            title="Students"
          >
            <span className="nav-icon">
                <BookOpen size={18} />
              </span>

              <span className="nav-text">Students</span>
            </NavLink>

            <NavLink
            to="/admin/partnercompanies"
            end
            onClick={closeSidebarOnMobile}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
            title="Partner Companies"
          >
            <span className="nav-icon">
                <Handshake size={18} />
              </span>

              <span className="nav-text">Partner Companies</span>
            </NavLink>

            <NavLink
            to="/admin/ojtcoordinators"
            end
            onClick={closeSidebarOnMobile}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
            title="OJT Coordinators"
          >
            <span className="nav-icon">
                <FileAxis3d size={18} />
              </span>

              <span className="nav-text">OJT Coordinators</span>
            </NavLink>

            <NavLink
            to="/admin/attendance"
            end
            onClick={closeSidebarOnMobile}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
            title="Attendance"
          >
            <span className="nav-icon">
                <ListChecks size={18} />
              </span>

              <span className="nav-text">Attendance</span>
            </NavLink>

                        <NavLink
            to="/admin/ojthours"
            end
            onClick={closeSidebarOnMobile}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
            title="OJT Hours"
          >
            <span className="nav-icon">
                <BookOpenCheck size={18} />
              </span>

              <span className="nav-text">OJT Hours</span>
            </NavLink>

                        <NavLink
            to="/admin/evaluation"
            end
            onClick={closeSidebarOnMobile}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
            title="Evaluation"
          >
            <span className="nav-icon">
                <ChartCandlestick size={18} />
              </span>

              <span className="nav-text">Evaluation</span>
            </NavLink>

            <NavLink
            to="/admin/ojtreports"
            end
            onClick={closeSidebarOnMobile}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
            title="Ojt Reports"
          >
            <span className="nav-icon">
                <Summary size={18} />
              </span>

              <span className="nav-text">OJT Reports</span>
            </NavLink>

            <NavLink
            to="/admin/attendancereports"
            end
            onClick={closeSidebarOnMobile}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
            title="Attendance Reports"
          >
            <span className="nav-icon">
                <ListCheck size={18} />
              </span>

              <span className="nav-text">Attendance Reports</span>
            </NavLink>

            <NavLink
            to="/admin/users"
            end
            onClick={closeSidebarOnMobile}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
            title="Users"
          >
            <span className="nav-icon">
                <Users size={18} />
              </span>

              <span className="nav-text">Users</span>
            </NavLink>

                        <NavLink
            to="/admin/settings"
            end
            onClick={closeSidebarOnMobile}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
            title="Settings"
          >
            <span className="nav-icon">
                <Settings size={18} />
              </span>

              <span className="nav-text">Settings</span>
            </NavLink>





          
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



