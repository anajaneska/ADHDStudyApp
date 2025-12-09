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

    // Reload the page to fetch updated data from backend
    window.location.reload();
  } catch (err) {
    console.error("Error saving settings", err);
  }
};


  if (!editMode) return null;

  return (
    <div className="settings-modal">
      <h3>Change Timer Durations</h3>
      <div className="settings-inputs">
        <label>
          Focus Duration (minutes):
          <input
            type="number"
            min="1"
            value={tempWork}
            onChange={(e) => setTempWork(parseInt(e.target.value) || 1)}
          />
        </label>
        <label>
          Break Duration (minutes):
          <input
            type="number"
            min="1"
            value={tempBreak}
            onChange={(e) => setTempBreak(parseInt(e.target.value) || 1)}
          />
        </label>
      </div>
      <div className="settings-buttons">
        <button onClick={saveSettings} className="btn btn-save">Save</button>
        <button onClick={() => setEditMode(false)} className="btn btn-cancel">Cancel</button>
      </div>
    </div>
  );
}
