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
          ? res.data.questions.map(q => ({
              question: q.questionText,
              options: q.options,
              correctAnswer: q.correctAnswer
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

  const generateQuiz = async () => {
    setLoading(true);
    try {
      const res = await instance.post(`/files/${userId}/${file.id}/quiz`);
      const data = res.data.questions
        ? res.data.questions.map(q => ({
            question: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer
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

  // DELETE QUIZ
  const deleteQuiz = async () => {
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

  const handleSelect = (qIdx, option) => {
    if (!submitted) {
      setAnswers({ ...answers, [qIdx]: option });
    }
  };

  const handleSubmit = () => {
    let correctCount = 0;
    quiz.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) correctCount++;
    });
    setScore(correctCount);
    setSubmitted(true);
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      {!quiz.length && (
        <button
          onClick={generateQuiz}
          className="bg-purple-500 text-white px-4 py-2 rounded"
        >
          Generate Quiz
        </button>
      )}

      {quiz.length > 0 && (
        <>


          <div className="space-y-4 mt-4">
            {submitted && (
              <div className="text-xl font-bold mb-4">
                Your Score: {score} / {quiz.length}
              </div>
            )}

            {quiz.map((q, idx) => (
              <div key={idx} className="p-4 bg-white shadow rounded">
                <p className="font-semibold">{idx + 1}. {q.question}</p>
                <ul className="mt-2 space-y-1">
                  {q.options.map((opt, i) => {
                    const isSelected = answers[idx] === opt;
                    const isCorrect = submitted && opt === q.correctAnswer;
                    const isWrong = submitted && isSelected && opt !== q.correctAnswer;

                    let bgColor = "bg-gray-50";
                    if (isCorrect) bgColor = "bg-green-200 border-green-400";
                    if (isWrong) bgColor = "bg-red-200 border-red-400";
                    if (!submitted && isSelected) bgColor = "bg-blue-100 border-blue-400";

                    return (
                      <li
                        key={i}
                        onClick={() => handleSelect(idx, opt)}
                        className={`p-2 rounded cursor-pointer border ${bgColor}`}
                      >
                        {opt}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

            {!submitted && (
              <button
                onClick={handleSubmit}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
              >
                Submit Quiz
              </button>
            )}
                     {/* DELETE BUTTON */}
          <button
            onClick={deleteQuiz}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Delete Quiz
          </button>
          </div>
        </>
      )}
    </div>
  );
}
