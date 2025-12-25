import React from "react";
import OrganizationToDoList from "../components/ToDoList/todolistorg";
import CalendarView from "../components/Calendar/calendar";

export default function OrganizationPage() {
  return (
    <div className="container-fluid pt-5 px-3">
      <div
        className="row g-4"
        style={{
          maxWidth: "1600px",
          margin: "0 auto",
          minHeight: "calc(100vh - 80px)",
        }}
      >
        {/* LEFT – TODO (same size, pushed left) */}
        <div className="col-12 col-md-4 col-lg-5">
          <OrganizationToDoList />
        </div>

        {/* RIGHT – CALENDAR (wider + full visible height) */}
        <div className="col-12 col-md-8 col-lg-7">
          <div
            className="bg-white rounded-3 shadow p-3 h-100"
            style={{ minHeight: "calc(100vh - 120px)" }}
          >
            <CalendarView />
          </div>
        </div>
      </div>
    </div>
  );
}
