import React, {useState,useEffect,useMemo,useCallback,} from "react";
import {Calendar,Views,dateFnsLocalizer,} from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import {format,parse,startOfWeek,getDay,} from "date-fns";
import enUS from "date-fns/locale/en-US";
import dayjs from "dayjs";
import instance from "../../custom-axios/axios";
import TaskModal from "./taskmodal";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "./calendar.css";
import mk from "date-fns/locale/mk";


/* ------------------------------------------------------------------ */
/* Calendar setup                                                      */
/* ------------------------------------------------------------------ */

// Enable drag & drop on calendar
const DnDCalendar = withDragAndDrop(Calendar);

// Locale configuration for react-big-calendar
const locales = {
  "mk-MK": mk,
};
// Localizer tells the calendar how to work with dates
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

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

/* ------------------------------------------------------------------ */
/* Helper functions                                                    */
/* ------------------------------------------------------------------ */

/**
 * Converts a backend task into one or more calendar events.
 * - Blue event → task duration (start → end)
 * - Red event  → due date
 */
function taskToEvents(task) {
  const events = [];

  const title = task.title || "Untitled task";
  const start = task.start ? new Date(task.start) : null;
  const end = task.end ? new Date(task.end) : null;
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;

  if (!start && !dueDate) return events;

  if (start && dueDate && start.getTime() === dueDate.getTime()) {
    events.push({
      id: `${task.id}-due`,
      taskId: task.id,
      title,
      start: dueDate,
      end: dueDate,
      type: "due",
      color: "#f87171",
    });
    return events;
  }

  if (start) {
    events.push({
      id: `${task.id}-task`,
      taskId: task.id,
      title,
      start,
      end: end ?? new Date(start.getTime() + 60 * 60 * 1000),
      type: "task",
      color: "#60a5fa",
    });
  }

  if (dueDate) {
    events.push({
      id: `${task.id}-due`,
      taskId: task.id,
      title: `${title} (Due)`,
      start: dueDate,
      end: dueDate,
      type: "due",
      color: "#f87171",
    });
  }

  return events;
}


/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export default function CalendarView() {
  /* ------------------------- State -------------------------------- */

  const [tasks, setTasks] = useState([]);
  const [currentView, setCurrentView] = useState(Views.MONTH);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  /* ------------------------- Auth --------------------------------- */

  // Ideally these should come from an AuthContext
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("jwt");

  /* ------------------------- API ---------------------------------- */

  /**
   * Fetch tasks from backend
   */
  const fetchTasks = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError("");

    try {
      const res = await instance.get(`/tasks/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  /* --------------------- Derived data ------------------------------ */

  /**
   * Convert tasks → calendar events
   * useMemo prevents recalculation on every render
   */
  const events = useMemo(() => {
    return tasks.flatMap(taskToEvents);
  }, [tasks]);

  /**
   * Find original task by ID (used when dragging/resizing)
   */
  const findTaskById = useCallback(
    (taskId) => tasks.find((t) => t.id === taskId),
    [tasks]
  );

  /* -------------------- Event updates ------------------------------ */

  /**
   * Shared logic for updating a task after drag or resize
   */
  const updateTaskDates = async (taskId, payload) => {
    await instance.put(`/tasks/${taskId}`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    await fetchTasks();
  };

  /**
   * Drag event to new date
   */
  const onEventDrop = async ({ event, start }) => {
    const originalTask = findTaskById(event.taskId);
    if (!originalTask) return;

    try {
      // Due-date drag
      if (event.type === "due") {
        await updateTaskDates(event.taskId, {
          dueDate: dayjs(start).toISOString(),
        });
        return;
      }

      // Task drag → preserve original duration
      const origStart = originalTask.start
        ? new Date(originalTask.start)
        : null;
      const origEnd = originalTask.end
        ? new Date(originalTask.end)
        : null;

      const duration =
        origStart && origEnd
          ? origEnd.getTime() - origStart.getTime()
          : 60 * 60 * 1000;

      await updateTaskDates(event.taskId, {
        start: dayjs(start).toISOString(),
        end: dayjs(new Date(start.getTime() + duration)).toISOString(),
      });
    } catch (err) {
      console.error("Drag update failed:", err);
    }
  };

  /**
   * Resize event duration
   */
  const onEventResize = async ({ event, start, end }) => {
    try {
      if (event.type === "due") {
        await updateTaskDates(event.taskId, {
          dueDate: dayjs(start).toISOString(),
        });
        return;
      }

      await updateTaskDates(event.taskId, {
        start: dayjs(start).toISOString(),
        end: dayjs(end ?? dayjs(start).add(1, "hour")).toISOString(),
      });
    } catch (err) {
      console.error("Resize update failed:", err);
    }
  };

  /* -------------------- UI handlers ------------------------------- */

  // Click empty slot → create task
  const handleSelectSlot = (slotInfo) => {
    setActiveTask(null);
    setSelectedSlot(slotInfo);
    setModalOpen(true);
  };

  // Click event → edit task
  const handleSelectEvent = (event) => {
    const task = findTaskById(event.taskId);
    if (!task) return;

    setActiveTask(task);
    setSelectedSlot({
      start: event.start,
      end: event.end,
    });
    setModalOpen(true);
  };

  /* -------------------- Rendering -------------------------------- */

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 w-full h-[80vh]">
      {loading && (
        <p className="text-center text-gray-500">
          Loading tasks...
        </p>
      )}

      {error && (
        <p className="text-center text-red-500">{error}</p>
      )}

      {!loading && !error && (
        <DnDCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable
          resizable
          draggableAccessor={(event) => event.type === "task"}
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
          onClose={() => {
            setModalOpen(false);
            setActiveTask(null);
            setSelectedSlot(null);
          }}
        />
      )}
    </div>
  );
}
