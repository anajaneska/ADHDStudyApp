import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import dayjs from "dayjs";

export default function CalendarView({ tasks }) {
  return (

    <div className="p-6 bg-white rounded-2xl shadow-lg mt-6">
      <h2 className="text-xl font-bold mb-4">Calendar</h2>
      <Calendar
        tileContent={({ date }) => {
          const dayTasks = tasks.filter(
            t => dayjs(t.plannedStart).isSame(dayjs(date), "day")
          );
          return (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {dayTasks.map(t => (
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
