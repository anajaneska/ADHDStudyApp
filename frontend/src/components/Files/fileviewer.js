import React, { useState } from "react";
import SummaryViewer from './Summary/summaryviewer';
import FlashcardsViewer from "./Flashcards/flashcardsviewer";
import QuizViewer from "./Quiz/quizviewer";

export default function FileViewer({ file }) {
  const [tab, setTab] = useState("summary");

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-4">{file.fileName}</h1>

      {/* Tabs */}
      <div className="flex gap-4 border-b pb-2 mb-4">
        <button onClick={() => setTab("summary")}
          className={`${tab === "summary" ? "border-b-2 border-blue-500 font-semibold" : ""}`}>
          Сумаризација
        </button>

        <button onClick={() => setTab("flashcards")}
          className={`${tab === "flashcards" ? "border-b-2 border-blue-500 font-semibold" : ""}`}>
          Картички за Учење
        </button>

        <button onClick={() => setTab("quiz")}
          className={`${tab === "quiz" ? "border-b-2 border-blue-500 font-semibold" : ""}`}>
          Квиз
        </button>
      </div>

      {/* Tab Content */}
      {tab === "flashcards" && <FlashcardsViewer key={file.id} file={file} />}
{tab === "summary" && <SummaryViewer key={file.id} file={file} />}
{tab === "quiz" && <QuizViewer key={file.id} file={file} />}
    </div>
  );
}
