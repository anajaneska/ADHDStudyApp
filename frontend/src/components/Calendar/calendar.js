import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Calendar, Views, dateFnsLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import dayjs from "dayjs";
import instance from "../../custom-axios/axios";
import "./calendar.css";

import TaskModal from "./taskmodal"; // modal provided below

const DnDCalendar = withDragAndDrop(Calendar);

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

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("jwt");

  // fetch tasks
  const fetchTasks = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await instance.get(`/tasks/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(Array.isArray(res.data) ? res.data : []);
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

  // convert tasks -> calendar events
  // logic:
  // - full task event (start -> end) shown in blue when start exists (end defaults on creation if missing)
  // - due date shown separately as red
  // - if start and dueDate have identical timestamp -> show only due (red)
  const events = useMemo(() => {
    return tasks.flatMap((task) => {
      const out = [];

      const start = task.start ? new Date(task.start) : null;
      // treat end: if present use it; backend might not set it — front-end sets on create/update
      const end = task.end ? new Date(task.end) : null;
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;

      // nothing to show
      if (!start && !dueDate) return [];

      // If start and dueDate exactly same timestamp -> show only due (red)
      if (start && dueDate && start.getTime() === dueDate.getTime()) {
        out.push({
          id: `${task.id}-due`,
          taskId: task.id,
          title: task.title,
          start: dueDate,
          end: dueDate,
          allDay: false,
          color: "#f87171",
          type: "due",
        });
        return out;
      }

      // Show start->end (full task) in blue if start exists
      if (start) {
        // if end missing, show one-hour event on calendar (frontend should set end on create; for safety, set display end here)
        const displayEnd = end ? end : new Date(start.getTime() + 60 * 60 * 1000);
        out.push({
          id: `${task.id}-task`,
          taskId: task.id,
          title: task.title,
          start,
          end: displayEnd,
          allDay: false,
          color: "#60a5fa",
          type: "task", // dragging/resizing updates start/end
        });
      }

      // Show due date separately in red if present (unless identical handled above)
      if (dueDate) {
        out.push({
          id: `${task.id}-due`,
          taskId: task.id,
          title: task.title + " (Due)",
          start: dueDate,
          end: dueDate,
          allDay: false,
          color: "#f87171",
          type: "due",
        });
      }

      return out;
    });
  }, [tasks]);

  // helper to keep duration when moving task event: if task had an end, preserve duration
  const findTaskById = (taskId) => tasks.find((t) => t.id === taskId);

  // onEventDrop: event is the calendar event object we created above
  const onEventDrop = async ({ event, start: newStart, end: newEnd, isAllDay }) => {
    const taskId = event.taskId;
    const originalTask = findTaskById(taskId);
    if (!originalTask) return;

    try {
      if (event.type === "due") {
        // update dueDate only
        const payload = { dueDate: dayjs(newStart).toISOString() };
        await instance.put(`/tasks/${taskId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // event.type === "task" (start/end)
        // If the event had duration, preserve it; otherwise set end = newStart + 1 hour
        const origStart = originalTask.start ? new Date(originalTask.start) : null;
        const origEnd = originalTask.end ? new Date(originalTask.end) : null;

        let payload = {};
        // newStart is the new start date after drop
        payload.start = dayjs(newStart).toISOString();

        if (origStart && origEnd) {
          const origDurationMs = origEnd.getTime() - origStart.getTime();
          const newEndPreserved = new Date(newStart.getTime() + origDurationMs);
          payload.end = dayjs(newEndPreserved).toISOString();
        } else {
          // no original end — default to 1 hour after new start
          payload.end = dayjs(newStart).add(1, "hour").toISOString();
        }

        await instance.put(`/tasks/${taskId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      // refresh
      await fetchTasks();
    } catch (err) {
      console.error("Error updating task after drop:", err);
    }
  };

  // onEventResize - update start/end for task event. treat like onEventDrop for simplicity
  const onEventResize = async ({ event, start: newStart, end: newEnd }) => {
    const taskId = event.taskId;
    if (!taskId) return;
    try {
      if (event.type === "due") {
        // resizing due doesn't make sense — treat as updating due to new start
        const payload = { dueDate: dayjs(newStart).toISOString() };
        await instance.put(`/tasks/${taskId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // update both start and end with newStart/newEnd
        const payload = {
          start: newStart ? dayjs(newStart).toISOString() : null,
          end: newEnd ? dayjs(newEnd).toISOString() : null,
        };

        // if newEnd missing (shouldn't happen on resize) default to +1h
        if (!payload.end && payload.start) {
          payload.end = dayjs(payload.start).add(1, "hour").toISOString();
        }

        await instance.put(`/tasks/${taskId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      await fetchTasks();
    } catch (err) {
      console.error("Error updating task after resize:", err);
    }
  };

  // click empty slot -> open create modal with selected slot
  const handleSelectSlot = (slotInfo) => {
    // slotInfo contains start/end
    setActiveTask(null);
    setSelectedSlot(slotInfo);
    setModalOpen(true);
  };

  // click event -> open edit modal
  const handleSelectEvent = (event) => {
    const t = tasks.find((x) => x.id === event.taskId);
    if (!t) return;
    setActiveTask(t);
    setSelectedSlot({ start: event.start, end: event.end });
    setModalOpen(true);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 w-full h-[80vh]">
      {loading && <p className="text-center text-gray-500">Loading tasks...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && !error && (
        <DnDCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable
          resizable
          draggableAccessor={() => true}
          onEventDrop={onEventDrop}
          onEventResize={onEventResize}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          view={currentView}
          onView={setCurrentView}
          views={[Views.DAY, Views.WEEK, Views.MONTH]}
          popup
          style={{ height: "100%" }}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: event.color || "#3b82f6",
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
          onClose={() => {
            setModalOpen(false);
            setActiveTask(null);
            setSelectedSlot(null);
          }}
          task={activeTask}
          selectedSlot={selectedSlot}
          refresh={fetchTasks}
        />
      )}
    </div>
  );
}
