import React from "react";
import ToDoList from "../components/ToDoList/todolist.js";
import CalendarView from "../components/Calendar/calendar.js";

export default function OrganizationPage() {
  return (
    <div className="flex w-full h-screen bg-gray-100 overflow-hidden">
      {/* Left side – To-Do List */}
      <div className="w-1/2 p-6 overflow-y-auto bg-white shadow-xl border-r border-gray-200">
        <h1 className="text-2xl font-bold mb-4 text-center">To-Do List</h1>
        <ToDoList />
      </div>

      {/* Right side – Calendar */}
      <div className="w-1/2 p-6 overflow-y-auto bg-white shadow-xl">
        <h1 className="text-2xl font-bold mb-4 text-center">Calendar</h1>
        <CalendarView />
      </div>
    </div>
  );
}
