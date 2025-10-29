import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Calendar, Views, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import dayjs from "dayjs";
import instance from "../../custom-axios/axios";

// --- Localization setup for date-fns ---
const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function CalendarView({ setFeatures }) {
  const [tasks, setTasks] = useState([]);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [currentView, setCurrentView] = useState(Views.MONTH);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("jwt");

  // --- Fetch tasks from backend ---
  const fetchTasks = useCallback(async () => {
    if (!userId) {
      console.error("User ID not found in localStorage");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await instance.get(`/tasks/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Tasks fetched in CalendarView:", res.data);
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to fetch tasks. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // --- Convert tasks to calendar events ---
  const events = useMemo(() => {
    return tasks
      .map((task) => {
        if (!task.plannedStart && !task.dueDate) return null;

        const start = new Date(task.plannedStart || task.dueDate);
        const end = task.dueDate ? new Date(task.dueDate) : start;

        if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

        return {
          id: task.id,
          title: `${task.title}${
            task.dueDate
              ? ` (Start: ${dayjs(task.plannedStart).format(
                  "DD/MM HH:mm"
                )}, Due: ${dayjs(task.dueDate).format("DD/MM HH:mm")})`
              : ` (Start: ${dayjs(task.plannedStart).format("DD/MM HH:mm")})`
          }`,
          start,
          end,
          allDay: false,
        };
      })
      .filter(Boolean);
  }, [tasks]);

  // --- Dragging logic ---
  const handleMouseDown = (e) => {
    setIsDragging(true);
    const offsetX = e.clientX - position.x;
    const offsetY = e.clientY - position.y;

    const handleMouseMove = (event) => {
      setPosition({
        x: event.clientX - offsetX,
        y: event.clientY - offsetY,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        position: "fixed",
        top: position.y,
        left: position.x,
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        zIndex: 1000,
        width: "650px",
        height: "520px",
        transition: isDragging ? "none" : "transform 0.2s ease",
      }}
      className="p-4 bg-white rounded-2xl shadow-2xl select-none"
    >
      {/* --- Header --- */}
      <div className="flex justify-between items-center mb-3 relative">
        <h2 className="text-xl font-bold text-center w-full">Calendar</h2>
        <button
          onClick={() => setFeatures((prev) => ({ ...prev, calendar: false }))}
          className="absolute right-2 top-0 text-red-500 font-bold text-lg hover:text-red-700"
        >
          ✕
        </button>
      </div>

      {/* --- Loading / Error States --- */}
      {loading && <p className="text-center text-gray-500">Loading tasks...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* --- Calendar Component --- */}
      {!loading && !error && (
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "420px" }}
          view={currentView}
          onView={setCurrentView}
          views={[Views.DAY, Views.WEEK, Views.MONTH]}
          popup
          messages={{
            month: "Month",
            week: "Week",
            day: "Day",
            today: "Today",
          }}
        />
      )}
    </div>
  );
}
