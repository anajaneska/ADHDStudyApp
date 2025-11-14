import React, { useState, useEffect } from "react";
import instance from "../custom-axios/axios";
import FileSidebar from "../components/Files/filesidebar";
import FileViewer from "../components/Files/fileviewer";

export default function FileDashboard() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    instance
      .get(`/files/${userId}`)
      .then((res) => setFiles(res.data))
      .catch((err) => console.error("Error loading files:", err));
  }, [userId]);

  const handleFileClick = (file) => {
    setSelectedFile(file);
  };

  return (
    <div className="flex h-screen bg-gray-100 pt-20"> 
      {/* ↑ adds space below the header */}

      {/* Sidebar */}
      <FileSidebar files={files} onSelect={handleFileClick} />

      {/* Main Panel */}
      <div className="flex-1 p-6 overflow-auto">
        {selectedFile ? (
        <FileViewer key={selectedFile?.id} file={selectedFile} />
        ) : (
          <div className="text-center text-gray-500 mt-20 text-xl">
            Select a file from the sidebar to begin.
          </div>
        )}
      </div>
    </div>
  );
}
