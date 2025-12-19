import React, { useState, useEffect } from "react";
import instance from "../../../custom-axios/axios";

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
    if (!submitted) {
      setAnswers({ ...answers, [qIdx]: option });
    }
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
    return <p className="text-gray-500 text-center mt-4">Loading...</p>;

  return (
    <div className="relative w-full max-w-3xl mx-auto p-4">
      {/* Trash button */}
      {quiz.length > 0 && (
        <div className="flex justify-end mb-4">
          <button
            onClick={deleteQuiz}
            title="Избриши Квиз"
            className="text-gray-400 hover:text-red-500 transition text-2xl"
          >
            🗑️
          </button>
        </div>
      )}

      {/* Generate quiz button */}
      {!quiz.length && (
        <div className="text-center mt-8">
          <button
            onClick={generateQuiz}
            className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition"
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
            <div className="text-xl font-bold mb-6 text-center">
              Твојот Резултат: {score} / {quiz.length}
            </div>
          )}

          <div className="space-y-6">
            {quiz.map((q, idx) => {
              const userAnswer = answers[idx];
              const unanswered = submitted && userAnswer === undefined;

              return (
                <div
                  key={idx}
                  className="p-6 bg-white shadow-lg rounded-xl flex flex-col gap-4 transition hover:scale-105"
                >
                  <p className="text-lg font-semibold">
                    {idx + 1}. {q.question}
                  </p>

                  <ul className="space-y-2">
                    {q.options.map((opt, i) => {
                      const isSelected = userAnswer === opt;
                      const isCorrect = submitted && opt === q.correctAnswer;
                      const isWrong = submitted && isSelected && opt !== q.correctAnswer;

                      let bgColor = "bg-gray-50";
                      if (isCorrect) bgColor = "bg-green-200 border border-green-400";
                      if (isWrong) bgColor = "bg-red-200 border border-red-400";
                      if (!submitted && isSelected)
                        bgColor = "bg-blue-100 border border-blue-400";

                      return (
                        <li
                          key={i}
                          onClick={() => handleSelect(idx, opt)}
                          className={`p-3 rounded cursor-pointer ${bgColor} transition`}
                        >
                          {opt}
                        </li>
                      );
                    })}
                  </ul>

                  {/* Feedback */}
                  {submitted && (
                    <div className="text-sm mt-2">
                      {unanswered && (
                        <span className="text-yellow-600">
                          ⚠️ Не е одговорено. Правилен одговор: {q.correctAnswer}
                        </span>
                      )}
                      {!unanswered && userAnswer === q.correctAnswer && (
                        <span className="text-green-700">✅ Правилно!</span>
                      )}
                      {!unanswered &&
                        userAnswer !== q.correctAnswer && (
                          <span className="text-red-700">
                            ❌ Погрешно. Твојот одговор: {userAnswer}. Правилен:{" "}
                            {q.correctAnswer}
                          </span>
                        )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit button */}
          {!submitted && (
            <div className="text-center mt-6">
              <button
                onClick={handleSubmit}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
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
