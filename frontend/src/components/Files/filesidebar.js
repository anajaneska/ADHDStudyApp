import React from "react";

export default function FileSidebar({ files, onSelect, onDelete }) {
  return (
    <div className="w-64 bg-white shadow-xl p-4 border-r overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Твоите Датотеки</h2>

      <ul className="space-y-2">
        {files.map((file) => (
          <li
            key={file.id}
            className="p-3 bg-gray-100 rounded-lg flex justify-between items-center hover:bg-blue-100 transition"
          >
            <span
              onClick={() => onSelect(file)}
              className="cursor-pointer flex-1"
            >
              📄 {file.fileName}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation(); // prevent selecting file when deleting
                onDelete(file.id);
              }}
              className="text-red-500 hover:text-red-700 font-bold ml-2"
            >
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
