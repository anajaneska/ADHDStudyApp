import React, { useState, useEffect } from "react";
import instance from "../../../custom-axios/axios";
import { FaTrash } from "react-icons/fa";

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

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    setFlipped(false);
  };

  const prevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    setFlipped(false);
  };

  const toggleFlip = () => setFlipped((f) => !f);

  if (loading) return <p className="text-center text-muted mt-3">Loading...</p>;

  return (
    <div className="d-flex flex-column align-items-center position-relative">
      {!flashcards.length && (
        <button
          onClick={generateFlashcards}
          className="btn btn-success mb-3"
        >
          Генерирај Картички за Учење
        </button>
      )}

      {flashcards.length > 0 && (
        <div className="w-100">
          {/* Delete icon */}
          <button
            onClick={deleteFlashcards}
            title="Избриши картички"
            className="btn position-absolute top-0 end-0 m-2 p-1 btn-light "
          >
            <FaTrash />
          </button>

          {/* Flashcard */}
          <div
            onClick={toggleFlip}
            className="card mx-auto my-3"
            style={{ maxWidth: "500px", minHeight: "250px", cursor: "pointer" }}
          >
            <div className="card-body d-flex flex-column justify-content-center align-items-center text-center">
              {flipped ? (
                <>
                  <h5 className="card-title">Одговор</h5>
                  <p className="card-text">{flashcards[currentIndex].answer}</p>
                </>
              ) : (
                <>
                  <h5 className="card-title">Прашање</h5>
                  <p className="card-text">{flashcards[currentIndex].question}</p>
                </>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="d-flex justify-content-center gap-2 flex-wrap mb-2">
            <button className="btn btn-secondary" onClick={prevCard}>Претходно</button>
            <button className="btn btn-secondary" onClick={nextCard}>Следно</button>
          </div>

          {/* Counter */}
          <p className="text-center text-muted mb-3">
            {currentIndex + 1} / {flashcards.length}
          </p>
        </div>
      )}
    </div>
  );
}
