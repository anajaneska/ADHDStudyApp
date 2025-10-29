import React, { useEffect, useState } from "react";
import instance from "../../custom-axios/axios";

export default function Notes({ setFeatures }) {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState({ title: "", content: "" });
  const [editingNoteId, setEditingNoteId] = useState(null);

  const [position, setPosition] = useState({ x: 150, y: 150 });
  const [isDragging, setIsDragging] = useState(false);

  const userId = Number(localStorage.getItem("userId"));
  const token = localStorage.getItem("jwt");

  // Fetch notes from backend
  const fetchNotes = async () => {
    if (!userId) return;
    try {
      const res = await instance.get(`/notes/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(res.data);
    } catch (err) {
      console.error("Error fetching notes:", err);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [userId]);

  // Save note
  const saveNote = async () => {
    if (!userId || !currentNote.title.trim()) return;

    try {
      if (editingNoteId) {
        await instance.put(`/notes/${editingNoteId}`, currentNote, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await instance.post(`/notes/${userId}`, currentNote, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setCurrentNote({ title: "", content: "" });
      setEditingNoteId(null);
      fetchNotes();
    } catch (err) {
      console.error("Error saving note:", err);
    }
  };

  // Dragging logic
  const handleMouseDown = (e) => {
    setIsDragging(true);
    const shiftX = e.clientX - position.x;
    const shiftY = e.clientY - position.y;

    const onMouseMove = (event) => {
      setPosition({
        x: event.clientX - shiftX,
        y: event.clientY - shiftY,
      });
    };

    const onMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        position: "fixed",
        top: position.y,
        left: position.x,
        cursor: isDragging ? "grabbing" : "grab",
        zIndex: 1100,
        userSelect: "none",
      }}
      className="p-6 bg-white rounded-2xl shadow-2xl w-[400px]"
    >
      {/* Header with Close X */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-center flex-1">Notepad</h2>
        <button
          onClick={() => setFeatures(prev => ({ ...prev, notes: false }))}
          className="text-red-500 font-bold"
        >
          ✕
        </button>
      </div>

      {/* Current Note Editor */}
      <div className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="Note title"
          className="border p-2 rounded"
          value={currentNote.title}
          onChange={(e) =>
            setCurrentNote({ ...currentNote, title: e.target.value })
          }
        />
        <textarea
          placeholder="Write your note..."
          className="border p-2 rounded resize-none"
          rows={8}
          value={currentNote.content}
          onChange={(e) =>
            setCurrentNote({ ...currentNote, content: e.target.value })
          }
        />
        <div className="flex gap-2">
          <button
            onClick={saveNote}
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex-1"
          >
            {editingNoteId ? "Save Edit" : "Save Note"}
          </button>
          {editingNoteId && (
            <button
              onClick={() => {
                setEditingNoteId(null);
                setCurrentNote({ title: "", content: "" });
              }}
              className="bg-gray-300 text-black py-2 rounded hover:bg-gray-400 flex-1"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
