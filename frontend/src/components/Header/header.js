import React from "react";
import { Link } from "react-router-dom";
import "./header.css";

export default function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-inner">
          {/* App Name */}
          <div className="app-name">Focus+Learn</div>

          {/* Navigation */}
          <nav className="nav-links">
            <Link to="/focus" className="nav-link">Focus Mode</Link>
            <Link to="/organize" className="nav-link">Organization</Link>
            <Link to="/" className="nav-link">HomePage</Link>
            <Link to="/filedashboard" className="nav-link">File Dashboard</Link>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link">Register</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
