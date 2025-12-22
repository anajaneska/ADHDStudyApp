import React, { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { FaClock, FaCalendarAlt, FaBookOpen } from "react-icons/fa";
import instance from "../../custom-axios/axios"; // your axios instance
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

        {isLoggedIn && (
          <div className="notification-wrapper" ref={dropdownRef}>
            <button className="bell" onClick={() => setDropdownOpen(!dropdownOpen)}>
              🔔
              {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </button>

            {dropdownOpen && (
              <div className="notification-dropdown">
                {notifications.length === 0 && (
                  <p className="no-notifications">No unread notifications</p>
                )}
                {notifications.map((n) => (
                  <div key={n.id} className={`notification-item ${n.type.toLowerCase()}`}>
                    <p className="notification-message">{n.message}</p>
                    <button
                      className="mark-seen-btn"
                      onClick={() => markAsSeen(n.id)}
                    >
                      Mark as seen
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
