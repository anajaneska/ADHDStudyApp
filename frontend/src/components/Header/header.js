import React from "react";
import { NavLink, Link } from "react-router-dom";
import "./header.css";
import { FaClock, FaCalendarAlt, FaBookOpen, FaHome } from "react-icons/fa";


export default function Header() {
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-inner">

          <div className="left-section">
            <div className="app-name">
              <NavLink to="/">
                Focus Nest
              </NavLink>
            </div>

            <nav className="nav-links">

              <NavLink to="/focus"
                className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link" }>
                <FaClock className="nav-icon" />
                Focus
              </NavLink>
              <NavLink to="/organize"
                className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link" }>
                <FaCalendarAlt className="nav-icon" />
                Organize
              </NavLink>
              <NavLink to="/filedashboard"
                className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link" }>
                <FaBookOpen className="nav-icon" />
                Study
              </NavLink>
            </nav>
          </div>

          <div className="auth-section">
            {!isLoggedIn ? (
              <>
                <Link to="/login" className="nav-link auth-link">Login</Link>
                <Link to="/register" className="nav-link auth-link">Register</Link>
              </>
            ) : (
              <button
                className="logout-btn"
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.reload();
                }}
              >
                Logout
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}