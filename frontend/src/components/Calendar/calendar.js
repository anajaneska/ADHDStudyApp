import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Calendar, Views, dateFnsLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { format, parse, startOfWeek, getDay } from "date-fns";
import dayjs from "dayjs";
import instance from "../../custom-axios/axios";
import TaskModal from "./taskmodal";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "./calendar.css";
import mk from "date-fns/locale/mk";

// Enable drag & drop
const DnDCalendar = withDragAndDrop(Calendar);

// Localizer setup
const locales = { "mk-MK": mk };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// MK messages
const messagesMk = {
  today: "Денес",
  previous: "Назад",
  next: "Напред",
  month: "Месец",
  week: "Недела",
  day: "Ден",
  agenda: "Агенда",
  showMore: (total) => `+${total} повеќе`,
};

// Convert a task into calendar events, including recurrence
function taskToEvents(task) {
  const events = [];
  if (!task.startDate) return events;

  const startDate = dayjs(task.startDate);
  const startTimeParts = task.startTime ? task.startTime.split(":").map(Number) : [0, 0];
  const endTimeParts = task.endTime ? task.endTime.split(":").map(Number) : [startTimeParts[0] + 1, startTimeParts[1]];

  const dueDate = task.dueDate ? dayjs(task.dueDate) : null;
  const recurrenceType = task.recurrenceType || "NONE";
  const interval = task.recurrenceInterval || 1;
  const recurrenceEnd = task.recurrenceEnd ? dayjs(task.recurrenceEnd) : startDate.add(30, "day"); // default 30 days

  let current = startDate.clone();

  while (current.isBefore(recurrenceEnd) || current.isSame(recurrenceEnd, "day")) {
    const start = current.hour(startTimeParts[0]).minute(startTimeParts[1]).toDate();
    const end = current.hour(endTimeParts[0]).minute(endTimeParts[1]).toDate();

    events.push({
      id: `${task.id}-${current.format("YYYYMMDD")}`,
      taskId: task.id,
      title: task.title,
      start,
      end,
      type: "task",
      color: "#60a5fa",
    });

    if (recurrenceType === "DAILY") current = current.add(interval, "day");
    else if (recurrenceType === "WEEKLY") current = current.add(interval, "week");
    else if (recurrenceType === "MONTHLY") current = current.add(interval, "month");
    else break;
  }

  if (dueDate) {
    events.push({
      id: `${task.id}-due`,
      taskId: task.id,
      title: `${task.title} (Рок)`,
      start: dueDate.toDate(),
      end: dueDate.toDate(),
      type: "due",
      color: "#f87171",
    });
  }

  return events;
}


export default function CalendarView() {
  const [tasks, setTasks] = useState([]);
  const [currentView, setCurrentView] = useState(Views.MONTH);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("jwt");

  const fetchTasks = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError("");
    try {
      const res = await instance.get(`/tasks/organization/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Не успеа да се вчитаат задачите.");
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const events = useMemo(() => tasks.flatMap(taskToEvents), [tasks]);

  const findTaskById = useCallback((taskId) => tasks.find(t => t.id === taskId), [tasks]);

  const updateTaskDates = async (taskId, payload) => {
    await instance.put(`/tasks/${taskId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
    await fetchTasks();
  };

  const onEventDrop = async ({ event, start }) => {
    const originalTask = findTaskById(event.taskId);
    if (!originalTask || originalTask.recurrenceType !== "NONE") return;

    try {
      if (event.type === "due") {
        await updateTaskDates(event.taskId, { dueDate: dayjs(start).toISOString() });
        return;
      }
      const origStart = originalTask.startDate ? dayjs(originalTask.startDate).toDate() : null;
      const origEnd = originalTask.endTime ? dayjs(originalTask.endTime, "HH:mm").toDate() : null;
      const duration = origStart && origEnd ? origEnd.getTime() - origStart.getTime() : 60 * 60 * 1000;
      await updateTaskDates(event.taskId, {
        startDate: dayjs(start).toISOString(),
        endTime: dayjs(new Date(start.getTime() + duration)).format("HH:mm"),
      });
    } catch (err) { console.error("Drag update failed:", err); }
  };

  const onEventResize = async ({ event, start, end }) => {
    const originalTask = findTaskById(event.taskId);
    if (!originalTask || originalTask.recurrenceType !== "NONE") return;

    try {
      if (event.type === "due") {
        await updateTaskDates(event.taskId, { dueDate: dayjs(start).toISOString() });
        return;
      }
      await updateTaskDates(event.taskId, {
        startDate: dayjs(start).toISOString(),
        endTime: end ? dayjs(end).format("HH:mm") : dayjs(start).add(1, "hour").format("HH:mm"),
      });
    } catch (err) { console.error("Resize update failed:", err); }
  };

  const handleSelectSlot = (slotInfo) => {
    setActiveTask(null);
    setSelectedSlot(slotInfo);
    setModalOpen(true);
  };

  const handleSelectEvent = (event) => {
    const task = findTaskById(event.taskId);
    if (!task) return;
    setActiveTask(task);
    setSelectedSlot({ start: event.start, end: event.end });
    setModalOpen(true);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 w-full h-[80vh]">
      {loading && <p className="text-center text-gray-500">Вчитување задачи...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && !error && (
        <DnDCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable
          resizable
          draggableAccessor={(event) => {
            const t = tasks.find(t => t.id === event.taskId);
            return t?.recurrenceType === "NONE" && event.type === "task";
          }}
          onEventDrop={onEventDrop}
          onEventResize={onEventResize}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          view={currentView}
          onView={setCurrentView}
          views={[Views.DAY, Views.WEEK, Views.MONTH]}
          popup
          messages={messagesMk}
          culture="mk-MK"
          style={{ height: "100%" }}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: event.color,
              color: "white",
              borderRadius: "6px",
              border: "none",
              padding: "2px 6px",
            },
          })}
        />
      )}

      {modalOpen && (
        <TaskModal
          task={activeTask}
          selectedSlot={selectedSlot}
          refresh={fetchTasks}
          onClose={() => { setModalOpen(false); setActiveTask(null); setSelectedSlot(null); }}
        />
      )}
    </div>
  );
}
