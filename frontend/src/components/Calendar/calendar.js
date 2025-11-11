import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Calendar, Views, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import dayjs from "dayjs";
import instance from "../../custom-axios/axios";

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
  const [currentView, setCurrentView] = useState(Views.MONTH);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("jwt");

  // --- Fetch tasks from backend ---
  const fetchTasks = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await instance.get(`/tasks/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to fetch tasks.");
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
              ? ` (Start: ${dayjs(task.plannedStart).format("DD/MM HH:mm")}, Due: ${dayjs(task.dueDate).format("DD/MM HH:mm")})`
              : ` (Start: ${dayjs(task.plannedStart).format("DD/MM HH:mm")})`
          }`,
          start,
          end,
          allDay: false,
        };
      })
      .filter(Boolean);
  }, [tasks]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 w-full h-[80vh]">
      {loading && <p className="text-center text-gray-500">Loading tasks...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && !error && (
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          view={currentView}
          onView={setCurrentView}
          views={[Views.DAY, Views.WEEK, Views.MONTH]}
          popup
        />
      )}
    </div>
  );
}
