import React, { useRef } from "react";
import instance from "../../custom-axios/axios";
import "./filesidebar.css";

export default function FileSidebar({ files, onSelect, onDelete, userId, loadFiles }) {
  // Create ref here if parent doesn't provide it
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await instance.post(`/files/${userId}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      loadFiles(); // refresh list after upload
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  return (
    <div className="bg-white shadow p-3 border-end overflow-auto h-100">
      <h2 className="h5 fw-bold mb-3">Твоите Датотеки</h2>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />

      {/* Upload button */}
      <button
        className="btn text-white mb-3 w-100 shadow"
        style={{ backgroundColor: "rgba(139, 127, 199, 1)", borderRadius: "12px" }}
        onClick={() => fileInputRef.current?.click()}
      >
        Прикачи датотека
      </button>

      <ul className="list-unstyled mb-0">
        {files.map((file) => (
          <li
            key={file.id}
            className="d-flex justify-content-between align-items-center p-2 mb-2 rounded hover-shadow"
            style={{ cursor: "pointer" }}
          >
            <span className="flex-grow-1" onClick={() => onSelect(file)}>
              📄 {file.fileName}
            </span>

            <button
              type="button"
              className="btn btn-sm btn-outline-danger ms-2"
              onClick={(e) => {
                e.stopPropagation(); // prevent selecting file when deleting
                onDelete(file.id);
              }}
            >
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
