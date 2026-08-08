import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { logout } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import "../styles/AdminLayout.css";

function AdminLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="admin-layout">

      <header className="admin-header">
        <h2>Voting System</h2>

        <div className="admin-user">
          <span>{user?.email}</span>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <div className="admin-body">

        <aside className="sidebar">

          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/positions"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Positions
          </NavLink>

          <NavLink
            to="/admin/candidates"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Candidates
          </NavLink>

          <NavLink
            to="/admin/voters"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Voters
          </NavLink>

          <NavLink
            to="/admin/results"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Results
          </NavLink>

        </aside>

        <main className="content">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default AdminLayout;

