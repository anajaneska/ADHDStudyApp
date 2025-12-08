import React, { useState, useEffect } from "react";
import instance from "../../../custom-axios/axios";

export default function FlashcardsViewer({ file }) {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [flipped, setFlipped] = useState({});
  const userId = localStorage.getItem("userId");

  const fetchFlashcards = async () => {
    setLoading(true);
    try {
      const res = await instance.get(`/files/${userId}/${file.id}/flashcards`);
      let data = [];
      try {
        data = res.data.flashcardData ? JSON.parse(res.data.flashcardData) : [];
      } catch (parseError) {
        console.warn("Failed to parse flashcardData, showing raw string", parseError);
        data = [{ question: res.data.flashcardData, answer: "" }];
      }
      setFlashcards(data);
    } catch (err) {
      console.error("Error fetching flashcards:", err);
      setFlashcards([]);
    } finally {
      setLoading(false);
      setFlipped({});
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, [file, userId]);

  const generateFlashcards = async () => {
    setLoading(true);
    try {
      const res = await instance.post(`/files/${userId}/${file.id}/flashcards`);
      let data = [];
      try {
        data = res.data.flashcardData ? JSON.parse(res.data.flashcardData) : [];
      } catch {
        data = [{ question: res.data.flashcardData, answer: "" }];
      }
      setFlashcards(data);
    } catch (err) {
      console.error("Error generating flashcards:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteFlashcards = async () => {
    if (!window.confirm("Are you sure you want to delete all flashcards?")) return;

    setLoading(true);
    try {
      await instance.delete(`/files/${file.id}/flashcards`);
      setFlashcards([]);
    } catch (err) {
      console.error("Error deleting flashcards:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFlip = (idx) => {
    setFlipped((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      {!flashcards.length && (
        <button
          onClick={generateFlashcards}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Generate Flashcards
        </button>
      )}

      {flashcards.length > 0 && (
        <>
          <button
            onClick={deleteFlashcards}
            className="bg-red-500 text-white px-4 py-2 rounded mb-4"
          >
            Delete Flashcards
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flashcards.map((card, idx) => (
              <div
                key={idx}
                onClick={() => toggleFlip(idx)}
                className="p-6 bg-white border rounded shadow cursor-pointer select-none transition-transform duration-300 transform hover:scale-105 flex items-center justify-center text-center"
              >
                {flipped[idx] ? (
                  <div>
                    <strong>A:</strong> <br /> {card.answer}
                  </div>
                ) : (
                  <div>
                    <strong>Q:</strong> <br /> {card.question}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
