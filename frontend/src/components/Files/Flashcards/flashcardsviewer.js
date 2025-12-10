import React, { useState, useEffect } from "react";
import instance from "../../../custom-axios/axios";

export default function FlashcardsViewer({ file }) {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const userId = localStorage.getItem("userId");

  const fetchFlashcards = async () => {
    setLoading(true);
    try {
      const res = await instance.get(`/files/${userId}/${file.id}/flashcards`);
      let data = [];
      try {
        data = res.data.flashcardData ? JSON.parse(res.data.flashcardData) : [];
      } catch {
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
      setCurrentIndex(0);
      setFlipped(false);
    }
  };

  const deleteFlashcards = async () => {
    if (!window.confirm("Are you sure you want to delete all flashcards?")) return;

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

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    setFlipped(false);
  };

  const prevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    setFlipped(false);
  };

  const toggleFlip = () => setFlipped(!flipped);

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="flex flex-col items-center">
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

          <div
            onClick={toggleFlip}
            className="w-80 h-48 bg-white border rounded shadow cursor-pointer select-none flex items-center justify-center text-center p-4 transition-transform duration-300 transform hover:scale-105"
          >
            {flipped ? (
              <div>
                <strong>A:</strong> <br /> {flashcards[currentIndex].answer}
              </div>
            ) : (
              <div>
                <strong>Q:</strong> <br /> {flashcards[currentIndex].question}
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-4">
            <button
              onClick={prevCard}
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            >
              Previous
            </button>
            <button
              onClick={nextCard}
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            >
              Next
            </button>
          </div>

          <p className="mt-2 text-sm text-gray-600">
            {currentIndex + 1} / {flashcards.length}
          </p>
            <br/>
               <button
            onClick={deleteFlashcards}
            className="bg-red-500 text-white px-4 py-2 rounded mb-4">
            Delete Flashcards
          </button>
         
        </>
        
      )}
    </div>
  );
}
