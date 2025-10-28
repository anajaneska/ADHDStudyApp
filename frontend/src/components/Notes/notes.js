import React, { useEffect, useState } from "react";
import instance from "../../custom-axios/axios";

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteData, setEditingNoteData] = useState({
    title: "",
    content: ""
  });

  const [position, setPosition] = useState({ x: 150, y: 150 });
  const [isDragging, setIsDragging] = useState(false);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("jwt");

  const fetchNotes = async () => {
    if (!userId) return console.error("User ID not found in localStorage");
    try {
      const res = await instance.get(`/notes/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Notes fetched from backend:", res.data);
      setNotes(res.data);
    } catch (err) {
      console.error("Error loading notes:", err);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [userId]);

  const createNote = async () => {
    if (!userId || !newNote.title.trim()) return;
    try {
      await instance.post(`/notes/${userId}`, newNote, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewNote({ title: "", content: "" });
      fetchNotes();
    } catch (err) {
      console.error("Error creating note:", err);
    }
  };

  const deleteNote = async (id) => {
    try {
      await instance.delete(`/notes/${userId}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(notes.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  const startEditing = (note) => {
    setEditingNoteId(note.id);
    setEditingNoteData({ title: note.title, content: note.content });
  };

  const saveEdit = async (id) => {
    try {
      await instance.put(`/notes/${id}`, editingNoteData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingNoteId(null);
      fetchNotes();
    } catch (err) {
      console.error("Error saving note:", err);
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const shiftX = e.clientX - position.x;
    const shiftY = e.clientY - position.y;

    const onMouseMove = (event) => {
      setPosition({
        x: event.clientX - shiftX,
        y: event.clientY - shiftY
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
        userSelect: "none"
      }}
      className="p-6 bg-white rounded-2xl shadow-2xl w-[400px]"
    >
      <h2 className="text-xl font-bold mb-4 text-center">📝 Notes</h2>

      {/* New Note Input */}
      <div className="mb-4 flex flex-col gap-2">
        <input
          type="text"
          placeholder="Note title"
          className="border p-2 rounded"
          value={newNote.title}
          onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
        />
        <textarea
          placeholder="Write your note..."
          className="border p-2 rounded resize-none"
          rows={3}
          value={newNote.content}
          onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
        />
        <button
          onClick={createNote}
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Add Note
        </button>
      </div>

      {/* Notes List */}
      <ul className="max-h-80 overflow-y-auto">
        {notes.length === 0 && (
          <p className="text-gray-500 text-sm">No notes yet — add one!</p>
        )}
        {notes.map((note) => (
          <li key={note.id} className="border-b py-3">
            {editingNoteId === note.id ? (
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={editingNoteData.title}
                  onChange={(e) =>
                    setEditingNoteData({
                      ...editingNoteData,
                      title: e.target.value
                    })
                  }
                  className="border p-1 rounded"
                />
                <textarea
                  rows={3}
                  value={editingNoteData.content}
                  onChange={(e) =>
                    setEditingNoteData({
                      ...editingNoteData,
                      content: e.target.value
                    })
                  }
                  className="border p-1 rounded resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(note.id)}
                    className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingNoteId(null)}
                    className="bg-gray-300 px-2 py-1 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-semibold">{note.title}</h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {note.content}
                </p>
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => startEditing(note)}
                    className="bg-yellow-400 px-2 py-1 rounded hover:bg-yellow-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="bg-red-400 px-2 py-1 rounded hover:bg-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}