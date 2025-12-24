import React, { useState, useEffect } from "react";
import instance from "../../custom-axios/axios";

export default function PomodoroSettings({
  editMode,
  setEditMode,
  workDuration,
  breakDuration,
  setWorkDuration,
  setBreakDuration,
  cycle,
  setTimeLeft,
}) {
  const [tempWork, setTempWork] = useState(workDuration);
  const [tempBreak, setTempBreak] = useState(breakDuration);
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("jwt");

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

      const newWork = response.data.focusDuration;
      const newBreak = response.data.breakDuration;

      setWorkDuration(newWork);
      setBreakDuration(newBreak);
      setTimeLeft(cycle === "work" ? newWork * 60 : newBreak * 60);

      setEditMode(false);
    } catch (err) {
      console.error("Error saving settings", err);
    }
  };

  if (!editMode) return null;

  return (
    <>
      {/* Bootstrap Modal */}
      <div className="modal show d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Промени Траење на Тајмерот</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={() => setEditMode(false)}
              ></button>
            </div>

            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Траење на Фокус (минути)</label>
                <input
                  type="number"
                  min="1"
                  value={tempWork}
                  onChange={(e) => setTempWork(parseInt(e.target.value) || 1)}
                  className="form-control"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Траење на пауза (минути)</label>
                <input
                  type="number"
                  min="1"
                  value={tempBreak}
                  onChange={(e) => setTempBreak(parseInt(e.target.value) || 1)}
                  className="form-control"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditMode(false)}
              >
                Откажи
              </button>
              <button
                type="button"
                className="btn"
                style={{ backgroundColor: "#8b7fc7", color: "white" }}
                onClick={saveSettings}
              >
                Зачувај
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      <div className="modal-backdrop fade show" onClick={() => setEditMode(false)}></div>
    </>
  );
}
