import React, { useState } from "react";

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

  const saveSettings = () => {
    if (tempWork > 0) setWorkDuration(tempWork);
    if (tempBreak > 0) setBreakDuration(tempBreak);
    switchCycle(cycle);
    setEditMode(false);
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
            onChange={(e) => setTempWork(parseInt(e.target.value))}
          />
        </label>
        <label>
          Break Duration (minutes):
          <input
            type="number"
            min="1"
            value={tempBreak}
            onChange={(e) => setTempBreak(parseInt(e.target.value))}
          />
        </label>
      </div>
      <div className="settings-buttons">
        <button onClick={saveSettings} className="btn btn-save">
          Save
        </button>
        <button onClick={() => setEditMode(false)} className="btn btn-cancel">
          Cancel
        </button>
      </div>
    </div>
  );
}
