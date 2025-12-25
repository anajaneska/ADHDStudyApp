import React, { useState, useEffect } from "react";
import instance from "../../../custom-axios/axios";
import { FaTrash } from "react-icons/fa";

export default function QuizViewer({ file }) {
  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const userId = localStorage.getItem("userId");

  // Fetch quiz
  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      try {
        const res = await instance.get(`/files/${userId}/${file.id}/quiz`);
        const data = res.data.questions
          ? res.data.questions.map((q) => ({
              question: q.questionText,
              options: q.options,
              correctAnswer: q.correctAnswer,
            }))
          : [];
        setQuiz(data);
      } catch {
        setQuiz([]);
      } finally {
        setLoading(false);
        setAnswers({});
        setSubmitted(false);
        setScore(0);
      }
    };
    fetchQuiz();
  }, [file, userId]);

  // Generate new quiz
  const generateQuiz = async () => {
    setLoading(true);
    try {
      const res = await instance.post(`/files/${userId}/${file.id}/quiz`);
      const data = res.data.questions
        ? res.data.questions.map((q) => ({
            question: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer,
          }))
        : [];
      setQuiz(data);
    } catch (err) {
      console.error("Error generating quiz:", err);
    } finally {
      setLoading(false);
      setAnswers({});
      setSubmitted(false);
      setScore(0);
    }
  };

  // Delete quiz
  const deleteQuiz = async () => {
    if (!window.confirm("Дали сте сигурни дека сакате да го избришете квизот?"))
      return;

    try {
      await instance.delete(`/files/${file.id}/quiz`);
      setQuiz([]);
      setAnswers({});
      setSubmitted(false);
      setScore(0);
    } catch (err) {
      console.error("Error deleting quiz:", err);
    }
  };

  // Select answer
  const handleSelect = (qIdx, option) => {
    if (!submitted) setAnswers({ ...answers, [qIdx]: option });
  };

  // Submit quiz
  const handleSubmit = () => {
    let correctCount = 0;
    quiz.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) correctCount++;
    });
    setScore(correctCount);
    setSubmitted(true);
  };

  if (loading)
    return <p className="text-center text-muted mt-3">Loading...</p>;

  return (
    <div className="container py-4">
      {/* Trash button */}
      {quiz.length > 0 && (
        <div className="d-flex justify-content-end mb-3">
          <button
            onClick={deleteQuiz}
            title="Избриши Квиз"
            className="btn btn-light border"
          >
            <FaTrash />
          </button>
        </div>
      )}

      {/* Generate quiz button */}
      {!quiz.length && (
        <div className="text-center my-5">
          <button
            onClick={generateQuiz}
            className="btn btn-primary btn-lg"
          >
            Генерирај Квиз
          </button>
        </div>
      )}

      {/* Quiz questions */}
      {quiz.length > 0 && (
        <>
          {/* Score display */}
          {submitted && (
            <div className="text-center mb-4">
              <h5>Твојот Резултат: {score} / {quiz.length}</h5>
            </div>
          )}

          <div className="row g-4">
            {quiz.map((q, idx) => {
              const userAnswer = answers[idx];
              const unanswered = submitted && userAnswer === undefined;

              return (
                <div key={idx} className="col-12">
                  <div className="card shadow-sm p-3">
                    <p className="fw-semibold mb-3">{idx + 1}. {q.question}</p>

                    <div className="list-group">
                      {q.options.map((opt, i) => {
                        const isSelected = userAnswer === opt;
                        const isCorrect = submitted && opt === q.correctAnswer;
                        const isWrong = submitted && isSelected && opt !== q.correctAnswer;

                        let bgClass = "list-group-item";
                        if (isCorrect) bgClass += " list-group-item-success";
                        if (isWrong) bgClass += " list-group-item-danger";
                        if (!submitted && isSelected) bgClass += " list-group-item-info";

                        return (
                          <button
                            type="button"
                            key={i}
                            className={`${bgClass} text-start`}
                            onClick={() => handleSelect(idx, opt)}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {/* Feedback */}
                    {submitted && (
                      <div className="mt-2">
                        {unanswered && (
                          <span className="text-warning">
                            ⚠️ Не е одговорено. Правилен одговор: {q.correctAnswer}
                          </span>
                        )}
                        {!unanswered && userAnswer === q.correctAnswer && (
                          <span className="text-success">✅ Правилно!</span>
                        )}
                        {!unanswered && userAnswer !== q.correctAnswer && (
                          <span className="text-danger">
                            ❌ Погрешно. Твојот одговор: {userAnswer}. Правилен: {q.correctAnswer}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit button */}
          {!submitted && (
            <div className="text-center mt-4">
              <button
                onClick={handleSubmit}
                className="btn btn-success btn-lg"
              >
                Провери Квиз
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
