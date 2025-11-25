import React from "react";
import ToDoList from "../components/ToDoList/todolist.js";
import CalendarView from "../components/Calendar/calendar.js";

export default function OrganizationPage() {
  return (
    <div className="flex w-full h-screen bg-gray-100 overflow-hidden">
      {/* Left side – To-Do List */}
      <div className="w-1/2 p-6 overflow-y-auto bg-white shadow-xl border-r border-gray-200">
      <br/>
      <br/>
        <ToDoList />
      </div>

      {/* Right side – Calendar */}
      <div className="w-1/2 p-6 overflow-y-auto bg-white shadow-xl">
      <br/>
      <br/>
        <CalendarView />
      </div>
    </div>
  );
}
