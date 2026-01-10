import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import useAuth from "../context/useAuth";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      {/* LEFT */}
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          CloudCart ☁️🛒
        </Link>
      </div>

      {/* RIGHT */}
      <div className="navbar-right">
        {/* DESKTOP LINKS */}
        <div className="desktop-links">
          {user && (
            <>
              <NavLink to="/products">Products</NavLink>
              <NavLink to="/cart">Cart</NavLink>
              <NavLink to="/orders">Orders</NavLink>
              <NavLink to="/expense">Expense</NavLink>

              {user.role === "admin" && (
                <>
                  <NavLink to="/admin/products">Admin</NavLink>
                  <NavLink to="/admin/dashboard">Dashboard</NavLink>
                </>
              )}
            </>
          )}

          {!user && (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          )}
        </div>

        {/* USER + LOGOUT */}
        {user && <span className="navbar-user">Hi, {user.name}</span>}
        {user && (
          <button className="navbar-logout" onClick={handleLogout}>
            Logout
          </button>
        )}

        {/* HAMBURGER (MOBILE ONLY) */}
        {user && (
          <button
            className="navbar-toggle"
            onClick={() => setOpen(!open)}
          >
            ☰
          </button>
        )}

        {/* MOBILE MENU CARD */}
        {user && (
          <div className={`menu-card ${open ? "open" : ""}`}>
            <NavLink to="/products">Products</NavLink>
            <NavLink to="/cart">Cart</NavLink>
            <NavLink to="/orders">Orders</NavLink>
            <NavLink to="/expense">Expense</NavLink>

            {user.role === "admin" && (
              <>
                <NavLink to="/admin/products">Admin</NavLink>
                <NavLink to="/admin/dashboard">Dashboard</NavLink>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

const NavLink = ({ to, children }) => (
  <Link to={to} className="navbar-link">
    {children}
  </Link>
);

export default Navbar;
