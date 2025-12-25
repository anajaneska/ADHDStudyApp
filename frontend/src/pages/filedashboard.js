import React, { useState, useEffect, useRef } from "react";
import instance from "../custom-axios/axios";
import FileSidebar from "../components/Files/filesidebar";
import FileViewer from "../components/Files/fileviewer";

export default function FileDashboard() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const userId = localStorage.getItem("userId");
  const fileInputRef = useRef(null);

   useEffect(() => {
    // Add class to body when page mounts
    document.body.classList.add("file-dashboard-page");

    // Remove class on unmount
    return () => document.body.classList.remove("file-dashboard-page");
  }, []);

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

  // DELETE FILE
 const handleDelete = async (fileId) => {
  try {
    await instance.delete(`/files/${userId}/${fileId}`);

    // Remove from UI
    setFiles((prev) => prev.filter((f) => f.id !== fileId));

    // If the deleted file was selected, clear the viewer
    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
    }

  } catch (err) {
    console.error("Delete failed:", err);
  }
};

  // Upload File
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
  <div
    className="container-fluid bg-light"
    style={{ height: "calc(100vh - 64px)" }} // space for header
  >
    <div className="row h-100">

      {/* SIDEBAR */}
      <div className="col-12 col-md-4 col-lg-3 border-end bg-white d-flex flex-column p-3 overflow-auto">

      {/* Spacer to preserve layout height */}
<div style={{ height: "48px" }} className="mb-3" />

        <FileSidebar
          files={files}
          onSelect={handleFileClick}
          onDelete={handleDelete}
        />
      </div>

      {/* MAIN VIEWER */}
      <div className="col-12 col-md-8 col-lg-9 p-4 overflow-auto">
        {selectedFile ? (
          <FileViewer key={selectedFile.id} file={selectedFile} />
        ) : (
          <div className="text-center text-muted mt-5 fs-5">
            Одбери датотека од менито лево за да ја прегледаш.
          </div>
        )}
      </div>

    </div>
  </div>
);

}
