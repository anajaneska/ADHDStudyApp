import React, { useState, useEffect } from "react";
import instance from "../../custom-axios/axios";

export default function PomodoroSettings({
  editMode,
  setEditMode,
  workDuration,
  breakDuration,
  setWorkDuration,
  setBreakDuration,
  switchCycle,
  cycle,
}) {
  const [tempWork, setTempWork] = useState(workDuration);
  const [tempBreak, setTempBreak] = useState(breakDuration);
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("jwt");

  // Reset modal inputs whenever it opens
  useEffect(() => {
    if (editMode) {
      setTempWork(workDuration);
      setTempBreak(breakDuration);
    }
  }, [editMode, workDuration, breakDuration]);

  const saveSettings = async () => {
    if (!userId) return;

    try {
      const response = await instance.put(
        `/pomodoro/settings/${userId}`,
        { focusDuration: tempWork, breakDuration: tempBreak },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update parent state
      setWorkDuration(response.data.focusDuration);
      setBreakDuration(response.data.breakDuration);

      switchCycle(cycle); // reset timer
      setEditMode(false);
    } catch (err) {
      console.error("Error saving settings", err);
    }
  };

  if (!editMode) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-40"
        onClick={() => setEditMode(false)}
      />

      {/* Modal content */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                      bg-white rounded-xl shadow-lg p-6 z-50 w-80">
        <h3 className="text-lg font-semibold mb-4">Промени Траење на Тајмерот</h3>

        <div className="space-y-4">
          <div>
            <label className="block mb-1">Траење на Фокус (минути)</label>
            <input
              type="number"
              min="1"
              value={tempWork}
              onChange={(e) => setTempWork(parseInt(e.target.value) || 1)}
              className="w-full border px-2 py-1 rounded"
            />
          </div>

          <div>
            <label className="block mb-1">Траење на пауза (минути)</label>
            <input
              type="number"
              min="1"
              value={tempBreak}
              onChange={(e) => setTempBreak(parseInt(e.target.value) || 1)}
              className="w-full border px-2 py-1 rounded"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={() => setEditMode(false)}
          >
            Откажи
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={saveSettings}
          >
            Зачувај
          </button>
        </div>
      </div>
    </>
  );
}
