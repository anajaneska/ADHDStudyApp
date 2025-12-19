import React, { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import "./header.css";
import { FaClock, FaCalendarAlt, FaBookOpen } from "react-icons/fa";

export default function Header() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("jwt"));

  // Optional: listen to changes in localStorage from other tabs
  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem("jwt"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-inner">

          <div className="left-section">
            <div className="app-name">
              <NavLink to="/">Focus Nest</NavLink>
            </div>

            <nav className="nav-links">
              <NavLink
                to="/focus"
                className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}
              >
                <FaClock className="nav-icon" /> Фокус
              </NavLink>
              <NavLink
                to="/organize"
                className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}
              >
                <FaCalendarAlt className="nav-icon" /> Планирање
              </NavLink>
              <NavLink
                to="/filedashboard"
                className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}
              >
                <FaBookOpen className="nav-icon" /> Учење
              </NavLink>
            </nav>
          </div>

          <div className="auth-section">
            {!isLoggedIn ? (
              <>
                <Link to="/login" className="nav-link auth-link">Најава</Link>
                <Link to="/register" className="nav-link auth-link">Регистрација</Link>
              </>
            ) : (
              <button className="logout-btn" onClick={handleLogout}>
                Одјава
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
