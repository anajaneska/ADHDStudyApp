import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import dayjs from "dayjs";
import React, { useState } from "react";


export default function CalendarView({ tasks }) {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);

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
      }}
      className="p-6 bg-white rounded-2xl shadow-2xl w-80 select-none"
    >
      <h2 className="text-xl font-bold mb-4 text-center">Calendar</h2>
      <Calendar
        tileContent={({ date }) => {
          const dayTasks = tasks.filter((t) =>
            dayjs(t.plannedStart).isSame(dayjs(date), "day")
          );
          return (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {dayTasks.map((t) => (
                <li key={t.id} style={{ fontSize: "0.7rem" }}>
                  {t.title}
                </li>
              ))}
            </ul>
          );
        }}
      />
    </div>
  );
}
