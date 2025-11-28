import React, { useState, useEffect, useRef } from "react";
import instance from "../custom-axios/axios";
import FileSidebar from "../components/Files/filesidebar";
import FileViewer from "../components/Files/fileviewer";

export default function FileDashboard() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const userId = localStorage.getItem("userId");
  const fileInputRef = useRef(null);

  // Load files
  const loadFiles = () => {
    instance
      .get(`/files/${userId}`)
      .then((res) => setFiles(res.data))
      .catch((err) => console.error("Error loading files:", err));
  };

  useEffect(() => {
    loadFiles();
  }, [userId]);

  const handleFileClick = (file) => {
    setSelectedFile(file);
  };

  // Upload File
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file); // IMPORTANT: must be "file"

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
    <div className="flex h-screen bg-gray-100 pt-20">

      {/* Sidebar + Upload button */}
      <div className="flex flex-col border-r bg-white">
        
        <button
          className="m-4 px-4 py-2 text-white rounded-xl shadow " style={{ backgroundColor: "rgba(139, 127, 199, 1)" }}
          onClick={() => fileInputRef.current.click()}
        >
          Upload File
        </button>

        {/* Hidden input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileUpload}
        />

        <FileSidebar files={files} onSelect={handleFileClick} />
      </div>

      {/* Main Viewer */}
      <div className="flex-1 p-6 overflow-auto">
        {selectedFile ? (
          <FileViewer key={selectedFile.id} file={selectedFile} />
        ) : (
          <div className="text-center text-gray-500 mt-20 text-xl">
            Select a file from the sidebar to begin.
          </div>
        )}
      </div>
    </div>
  );
}
