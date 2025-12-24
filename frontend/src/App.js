import './App.css';
import React, { Component } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from './components/Login-Register/login.js';
import Register from './components/Login-Register/register.js';
import FileDashboard from './pages/filedashboard.js';
import FocusPage from './pages/focuspage.js';
import Header from './components/Header/header.js';
import OrganizationPage from './pages/organizationpage.js';
import instance from "./custom-axios/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: !!localStorage.getItem("jwt"),
      notifications: [],
      unreadCount: 0,
    };
    this.pollingInterval = null;
  }

  componentDidMount() {
    if (this.state.isLoggedIn) {
      this.fetchNotifications();
      // Poll every 30 seconds
      this.pollingInterval = setInterval(this.fetchNotifications, 30 * 1000);
    }
  }

  componentWillUnmount() {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
  }

  getPoppedNotifications = () => {
    const popped = localStorage.getItem("poppedNotifications");
    return popped ? JSON.parse(popped) : [];
  };

  setPoppedNotifications = (ids) => {
    localStorage.setItem("poppedNotifications", JSON.stringify(ids));
  };

  fetchNotifications = async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("jwt");
    if (!userId || !token) return;

    try {
      const res = await instance.get(`/notifications/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter out seen notifications and already popped
      const poppedIds = this.getPoppedNotifications();
      const newNotifications = res.data.filter(
        n => !n.seen && !poppedIds.includes(n.id)
      );

      // Show pop-ups spaced out
      newNotifications.forEach((n, index) => {
        setTimeout(() => {
          toast.info(n.message, {
            position: "top-right",
            autoClose: 5000,
            pauseOnHover: true,
            closeOnClick: true,
          });

          // Add to popped
          const updatedPopped = [...this.getPoppedNotifications(), n.id];
          this.setPoppedNotifications(updatedPopped);
        }, index * 1000);
      });

      const unreadCount = res.data.filter(n => !n.seen).length;

      this.setState({ 
        notifications: res.data,
        unreadCount 
      });

    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  onLogin = () => {
    this.setState({ isLoggedIn: true }, this.fetchNotifications);
  };

  markAsSeen = async (id) => {
    const token = localStorage.getItem("jwt");
    try {
      await instance.put(`/notifications/${id}/seen`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      this.setState(prev => {
        const updated = prev.notifications.filter(n => n.id !== id);
        return {
          notifications: updated,
          unreadCount: updated.filter(n => !n.seen).length
        };
      });

    } catch (err) {
      console.error("Error marking notification as seen", err);
    }
  };

  render() {
    const { notifications, unreadCount, isLoggedIn } = this.state;

    return (
      <Router>
        {/* Header gets unreadCount and markAsSeen */}
        <Header 
          unreadCount={unreadCount} 
          notifications={notifications} 
          markAsSeen={this.markAsSeen} 
          isLoggedIn={isLoggedIn} 
        />

        <Routes>
          <Route path="/" element={<FocusPage/>} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login onLogin={this.onLogin} />} />
          <Route path="/filedashboard" element={<FileDashboard />} />
          <Route path="/focus" element={<FocusPage/>} />
          <Route path="/organize" element={<OrganizationPage/>} />
        </Routes>

        {/* Toast container */}
        <ToastContainer />
      </Router>
    );
  }
}

export default App;
