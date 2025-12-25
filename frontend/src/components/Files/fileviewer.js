import React, { useState } from "react";
import SummaryViewer from "./Summary/summaryviewer";
import FlashcardsViewer from "./Flashcards/flashcardsviewer";
import QuizViewer from "./Quiz/quizviewer";
import "./fileviewer.css";

export default function FileViewer({ file }) {
  const [tab, setTab] = useState("summary");

  const tabs = [
    { key: "summary", label: "Сумаризација" },
    { key: "flashcards", label: "Картички" },
    { key: "quiz", label: "Квиз" },
  ];

  return (
    <div className="bg-white p-4 p-md-5 rounded-3 shadow-sm h-100 d-flex flex-column">
      <h1 className="h6 fw-bold mb-4">{file.fileName}</h1>

      {/* Custom Tabs */}
      <div className="d-flex gap-2 mb-4 file-tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`file-tab-btn ${tab === t.key ? "active" : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-grow-1 overflow-auto" style={{ minHeight: 0 }}>
        {tab === "summary" && <SummaryViewer key={file.id} file={file} />}
        {tab === "flashcards" && <FlashcardsViewer key={file.id} file={file} />}
        {tab === "quiz" && <QuizViewer key={file.id} file={file} />}
      </div>
    </div>
  );
}
