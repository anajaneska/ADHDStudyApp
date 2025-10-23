import React, { useState, useEffect, useMemo } from "react";
import { Calendar, Views, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import dayjs from "dayjs";
import instance from "../../custom-axios/axios"; // your axios instance

// Initialize date-fns localizer
const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function CalendarView() {
  const [tasks, setTasks] = useState([]);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [currentView, setCurrentView] = useState(Views.MONTH);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("jwt");

  // Fetch tasks directly in the calendar
  useEffect(() => {
    const fetchTasks = async () => {
      if (!userId) return console.error("User ID not found in localStorage");
      try {
        const res = await instance.get(`/tasks/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Tasks fetched in CalendarView:", res.data);
        setTasks(res.data);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      }
    };
    fetchTasks();
  }, [userId, token]);

  // Map tasks to calendar events
  const events = useMemo(() => {
    return tasks
      .map((t) => {
        if (!t.plannedStart && !t.dueDate) return null;

        const start = t.plannedStart ? new Date(t.plannedStart) : new Date();
        const end = t.dueDate ? new Date(t.dueDate) : start;

        if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

        return {
          id: t.id,
          title: t.dueDate
            ? `${t.title} (Start: ${dayjs(t.plannedStart).format(
                "DD/MM HH:mm"
              )}, Due: ${dayjs(t.dueDate).format("DD/MM HH:mm")})`
            : `${t.title} (Start: ${dayjs(t.plannedStart).format(
                "DD/MM HH:mm"
              )})`,
          start,
          end,
          allDay: false,
        };
      })
      .filter(Boolean);
  }, [tasks]);

  // Drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    const shiftX = e.clientX - position.x;
    const shiftY = e.clientY - position.y;

    const onMouseMove = (event) => {
      setPosition({
        x: event.clientX - shiftX,
        y: event.clientY - shiftY,
      });
    };

    const onMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
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
        transition: isDragging ? "none" : "transform 0.2s ease",
        width: "650px",
        height: "500px",
      }}
      className="p-4 bg-white rounded-2xl shadow-2xl select-none"
    >
      <h2 className="text-xl font-bold mb-2 text-center">Calendar</h2>

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
      />
    </div>
  );
}
