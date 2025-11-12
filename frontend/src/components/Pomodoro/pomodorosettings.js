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

  return editMode ? (
    <div className="settings">
      <input
        type="number"
        value={tempWork}
        onChange={(e) => setTempWork(parseInt(e.target.value))}
      />
      <input
        type="number"
        value={tempBreak}
        onChange={(e) => setTempBreak(parseInt(e.target.value))}
      />
      <div className="settings-buttons">
        <button onClick={saveSettings} className="btn btn-save">
          Save
        </button>
        <button onClick={() => setEditMode(false)} className="btn btn-cancel">
          Cancel
        </button>
      </div>
    </div>
  ) : (
    <div className="settings">
      <button onClick={() => setEditMode(true)} className="btn btn-edit">
        Измени време
      </button>
    </div>
  );
}
