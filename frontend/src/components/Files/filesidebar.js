import React from "react";

export default function FileSidebar({ files, onSelect }) {
  return (
    <div className="w-64 bg-white shadow-xl p-4 border-r overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Your Files</h2>

      <ul className="space-y-2">
        {files.map((file) => (
          <li
            key={file.id}
            onClick={() => onSelect(file)}
            className="p-3 bg-gray-100 hover:bg-blue-100 cursor-pointer rounded-lg transition"
          >
            📄 {file.fileName}
          </li>
        ))}
      </ul>
    </div>
  );
}
