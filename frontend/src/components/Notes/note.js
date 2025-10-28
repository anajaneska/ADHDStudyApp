import React, { useState } from "react";
import Draggable from "react-draggable";

const Note = ({ note, onDelete, onUpdate }) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  const handleSave = () => {
    onUpdate({ title, content });
  };

  return (
    <Draggable>
      <div className="note-card">
        <div className="note-header">
          <input
            className="note-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
          />
          <button className="delete-btn" onClick={onDelete}>
            ✕
          </button>
        </div>
        <textarea
          className="note-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleSave}
          placeholder="Write something..."
        />
      </div>
    </Draggable>
  );
};

export default Note;
