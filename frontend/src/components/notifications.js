import React, { useEffect, useState } from "react"; 
import instance from "../../custom-axios/axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Notifications.css";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("jwt");

  // Load popped notifications from localStorage
  const getPoppedNotifications = () => {
    const popped = localStorage.getItem("poppedNotifications");
    return popped ? JSON.parse(popped) : [];
  };

  const setPoppedNotifications = (ids) => {
    localStorage.setItem("poppedNotifications", JSON.stringify(ids));
  };

  const loadNotifications = async () => {
    if (!userId || !token) return;
    try {
      const res = await instance.get(`/notifications/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter out seen notifications and already popped ones
      const poppedIds = getPoppedNotifications();
      const newNotifications = res.data.filter(
        n => !n.seen && !poppedIds.includes(n.id)
      );

      setNotifications(res.data);

      // Show pop-ups spaced out
      newNotifications.forEach((n, index) => {
        setTimeout(() => {
          toast.info(n.message, {
            position: "top-right",
            autoClose: 5000,
            pauseOnHover: true,
            closeOnClick: true,
          });

          // Add to poppedNotifications
          const updatedPopped = [...getPoppedNotifications(), n.id];
          setPoppedNotifications(updatedPopped);
        }, index * 1000); // space out by 1 second each
      });

    } catch (err) {
      console.error("Error loading notifications", err);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60 * 1000); // poll every minute
    return () => clearInterval(interval);
  }, []);

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

  if (notifications.length === 0) {
    return <p className="no-notifications">No notifications</p>;
  }

  return (
    <div className="notifications-container">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`notification-item ${n.type.toLowerCase()}`}
        >
          <div className="notification-header">
            <span className="notification-type">
              {n.type.replace("_", " ")}
            </span>
            <span className="notification-time">
              {new Date(n.createdAt).toLocaleTimeString()}
            </span>
          </div>

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
  );
}
