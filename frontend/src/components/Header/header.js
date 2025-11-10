import React from "react";
import { Link } from "react-router-dom";

{/*}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login onLogin={this.onLogin} />} />
          <Route path="/filedashboard" element={<FileDashboard />} />
          <Route path="/focus" element={<FocusPage/>} /> */}

export default function Header() {
  return (
    <header className="w-full bg-blue-700 text-white shadow-md fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / App Name */}
          <div className="flex-shrink-0 text-2xl font-bold">
            Focus+Learn
          </div>

          {/* Navigation Links */}
          <nav className="flex space-x-6">
            <Link
              to="/focus"
              className="hover:text-yellow-300 transition-colors duration-200"
            >
              Focus Mode
            </Link>
            <Link
              to="/"
              className="hover:text-yellow-300 transition-colors duration-200"
            >
              HomePage
            </Link>
            <Link
              to="/filedashboard"
              className="hover:text-yellow-300 transition-colors duration-200"
            >
              File Dashboard
            </Link>
            <Link
              to="/login"
              className="hover:text-yellow-300 transition-colors duration-200"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="hover:text-yellow-300 transition-colors duration-200"
            >
              Register
            </Link>
          </nav>

          {/* Optional User/Profile button */}
          <div className="flex items-center space-x-4">
            <button className="bg-yellow-400 text-black px-3 py-1 rounded hover:bg-yellow-500">
              Profile
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
