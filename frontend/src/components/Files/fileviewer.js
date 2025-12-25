import React, { useState } from "react";
import SummaryViewer from './Summary/summaryviewer';
import FlashcardsViewer from "./Flashcards/flashcardsviewer";
import QuizViewer from "./Quiz/quizviewer";

export default function FileViewer({ file }) {
  const [tab, setTab] = useState("summary");

  return (
    <div className="bg-white p-4 p-md-5 rounded-3 shadow-sm h-100 d-flex flex-column">
      <h1 className="h5 h-md4 fw-bold mb-3 mb-md-4">{file.fileName}</h1>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${tab === "summary" ? "active" : ""}`}
            onClick={() => setTab("summary")}
            type="button"
            role="tab"
          >
            Сумаризација
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${tab === "flashcards" ? "active" : ""}`}
            onClick={() => setTab("flashcards")}
            type="button"
            role="tab"
          >
            Картички за Учење
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${tab === "quiz" ? "active" : ""}`}
            onClick={() => setTab("quiz")}
            type="button"
            role="tab"
          >
            Квиз
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      <div
        className="tab-content flex-grow-1 overflow-auto"
        style={{ minHeight: 0 }} // necessary for flex scrolling
      >
        {tab === "summary" && (
          <div className="h-100">
            <SummaryViewer key={file.id} file={file} />
          </div>
        )}
        {tab === "flashcards" && (
          <div className="h-100">
            <FlashcardsViewer key={file.id} file={file} />
          </div>
        )}
        {tab === "quiz" && (
          <div className="h-100">
            <QuizViewer key={file.id} file={file} />
          </div>
        )}
      </div>
    </div>
  );
}
