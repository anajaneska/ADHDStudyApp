package mk.ukim.finki.backend.service;

import mk.ukim.finki.backend.model.Quiz;

import java.io.IOException;

public interface QuizService {
    Quiz generateAndSaveQuiz(Long fileId, Long userId) throws IOException;
    Quiz getQuiz(Long fileId, Long userId);
    void deleteQuiz(Long fileId);
}
