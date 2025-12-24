import React, { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { FaClock, FaCalendarAlt, FaBookOpen, FaBell } from "react-icons/fa";
import instance from "../../custom-axios/axios";
import "./header.css";

export default function Header() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("jwt"));
  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("jwt");

  const fetchNotifications = async () => {
    if (!userId || !token) return;
    try {
      const res = await instance.get(`/notifications/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  const markAsSeen = async (id) => {
    try {
      await instance.put(`/notifications/${id}/seen`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Error marking notification as seen", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60 * 1000);
    return () => clearInterval(interval);
  }, [userId, token]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    navigate("/login");
  };

  const unreadCount = notifications.length;

  return (
<header>
  <nav className="navbar navbar-expand-md navbar-light bg-light fixed-top py-2 shadow-sm">
    <div className="container">
      {/* Brand */}
      <NavLink className="navbar-brand fw-bold" to="/" style={{ color: '#4A5565' }}>
        Focus Nest
      </NavLink>

      {/* Toggler */}
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#mainNavbar"
        aria-controls="mainNavbar"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      {/* Collapsible content */}
      <div className="collapse navbar-collapse" id="mainNavbar">
        {/* LEFT: nav links */}
        <ul className="navbar-nav me-auto mb-2 mb-md-0">
          <li className="nav-item mx-2">
            <NavLink
              to="/focus"
              className={({ isActive }) => `nav-link${isActive ? ' active-link' : ''}`}
            >
              <FaClock className="me-1" />
              Фокус
            </NavLink>
          </li>
          <li className="nav-item mx-2">
            <NavLink
              to="/organize"
              className={({ isActive }) => `nav-link${isActive ? ' active-link' : ''}`}
            >
              <FaCalendarAlt className="me-1" />
              Планирање
            </NavLink>
          </li>
          <li className="nav-item mx-2">
            <NavLink
              to="/filedashboard"
              className={({ isActive }) => `nav-link${isActive ? ' active-link' : ''}`}
            >
              <FaBookOpen className="me-1" />
              Учење
            </NavLink>
          </li>
        </ul>

        {/* RIGHT: auth / actions */}
        <div className="d-flex align-items-center gap-3 mt-3 mt-md-0">
          {!isLoggedIn ? (
            <>
              <Link className="nav-link" to="/login" style={{ color: '#8b7fc7' }}>
                Најава
              </Link>
              <Link className="nav-link" to="/register" style={{ color: '#8b7fc7' }}>
                Регистрација
              </Link>
            </>
          ) : (
            <>
              {/* Notification bell */}
              <div className="position-relative" ref={dropdownRef}>
                <button
                  className="btn btn-link nav-link position-relative"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{ color: '#4A5565' }}
                >
                  <FaBell />
                  {unreadCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {dropdownOpen && (
                  <div className="dropdown-menu show end-0 mt-2 p-2">
                    {notifications.length === 0 && (
                      <span className="dropdown-item-text">
                        Нема нови известувања.
                      </span>
                    )}
                    {notifications.map((n) => (
                      <div key={n.id} className="dropdown-item-text">
                        <p className="mb-1">{n.message}</p>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => markAsSeen(n.id)}
                        >
                          Означи како прочитано
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Logout */}
              <button
                className="btn btn-outline"
                onClick={handleLogout}
                style={{ borderColor: '#4A5565', color: '#4A5565' }}
              >
                Одјава
              </button>
            </>
          )}
        </div>
      </div>
    </div>

  </nav>
</header>

);
}
