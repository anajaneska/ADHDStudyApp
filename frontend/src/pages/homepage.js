import React, { useEffect, useState } from "react";
import PomodoroTimer from "../components/Pomodoro/pomodoro";

const HomePage = () => {


  return (
    <div className="flex flex-col min-h-screen">

      <main>
         <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">Добредојде назад 👋</h1>
      <PomodoroTimer />
    </div>
      </main>

    </div>
  );
};

export default HomePage;