import React, { useState, useEffect } from "react";
import instance from "../../../custom-axios/axios";

export default function FlashcardsViewer({ file }) {
  /* ----------------------------- State ----------------------------- */

  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);

  // Is the card flipped (question ↔ answer)
  const [flipped, setFlipped] = useState(false);

  // Which flashcard is currently shown
  const [currentIndex, setCurrentIndex] = useState(0);

  const userId = localStorage.getItem("userId");

  /* ------------------------ Fetch flashcards ------------------------ */

  const fetchFlashcards = async () => {
    setLoading(true);
    try {
      const res = await instance.get(
        `/files/${userId}/${file.id}/flashcards`
      );

      // Backend stores flashcards as JSON string
      let data = [];
      try {
        data = res.data.flashcardData
          ? JSON.parse(res.data.flashcardData)
          : [];
      } catch {
        // Fallback if response is not valid JSON
        data = [{ question: res.data.flashcardData, answer: "" }];
      }

      setFlashcards(data);
    } catch (err) {
      console.error("Error fetching flashcards:", err);
      setFlashcards([]);
    } finally {
      setLoading(false);
      setFlipped(false);
      setCurrentIndex(0);
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, [file, userId]);

  /* ---------------------- Generate flashcards ----------------------- */

  const generateFlashcards = async () => {
    setLoading(true);
    try {
      const res = await instance.post(
        `/files/${userId}/${file.id}/flashcards`
      );

      let data = [];
      try {
        data = res.data.flashcardData
          ? JSON.parse(res.data.flashcardData)
          : [];
      } catch {
        data = [{ question: res.data.flashcardData, answer: "" }];
      }

      setFlashcards(data);
    } catch (err) {
      console.error("Error generating flashcards:", err);
    } finally {
      setLoading(false);
      setCurrentIndex(0);
      setFlipped(false);
    }
  };

  /* ----------------------- Delete flashcards ------------------------ */

  const deleteFlashcards = async () => {
    if (!window.confirm("Дали сте сигурни дека сакате да ги избришете картичките?"))
      return;

    setLoading(true);
    try {
      await instance.delete(`/files/${file.id}/flashcards`);
      setFlashcards([]);
      setCurrentIndex(0);
      setFlipped(false);
    } catch (err) {
      console.error("Error deleting flashcards:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------- Navigation logic ------------------------- */

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    setFlipped(false);
  };

  const prevCard = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + flashcards.length) % flashcards.length
    );
    setFlipped(false);
  };

  const toggleFlip = () => setFlipped((f) => !f);

  /* ---------------------------- Render ------------------------------ */

  if (loading) {
    return <p className="text-gray-500">Loading...</p>;
  }

  return (
    <div className="flex flex-col items-center relative">

      {/* No flashcards yet → generate button */}
      {!flashcards.length && (
        <button
          onClick={generateFlashcards}
          className="bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600 transition"
        >
          Генерирај Картички за Учење
        </button>
      )}

      {flashcards.length > 0 && (
        <>
          {/* ---------------- Delete icon (top-right) ---------------- */}
          <button
            onClick={deleteFlashcards}
            title="Избриши картички"
            className="absolute top-0 right-0 text-gray-400 hover:text-red-500 transition text-xl"
          >
            🗑️
          </button>

          {/* ---------------- Flashcard ---------------- */}
          <div
            onClick={toggleFlip}
            className="
              w-[500px] min-h-[300px] h-auto
              bg-white border rounded-xl shadow-lg
              cursor-pointer select-none
              flex items-center justify-center text-center
              p-6 mt-8
              transition-transform duration-300
              hover:scale-105
            "
          >
            {flipped ? (
              <div>
                <strong className="text-lg">Одговор</strong>
                <p className="mt-2 text-gray-700">
                  {flashcards[currentIndex].answer}
                </p>
              </div>
            ) : (
              <div>
                <strong className="text-lg">Прашање</strong>
                <p className="mt-2 text-gray-700">
                  {flashcards[currentIndex].question}
                </p>
              </div>
            )}
          </div>

          {/* ---------------- Navigation buttons ---------------- */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={prevCard}
              className="bg-gray-200 px-5 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Претходно
            </button>
            <button
              onClick={nextCard}
              className="bg-gray-200 px-5 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Следно
            </button>
          </div>

          {/* ---------------- Counter ---------------- */}
          <p className="mt-3 text-sm text-gray-600">
            {currentIndex + 1} / {flashcards.length}
          </p>
        </>
      )}
    </div>
  );
}
