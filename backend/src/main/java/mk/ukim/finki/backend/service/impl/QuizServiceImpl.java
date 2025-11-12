package mk.ukim.finki.backend.service.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import mk.ukim.finki.backend.model.Document;
import mk.ukim.finki.backend.model.Question;
import mk.ukim.finki.backend.model.Quiz;
import mk.ukim.finki.backend.repository.DocumentRepository;
import mk.ukim.finki.backend.repository.QuizRepository;
import mk.ukim.finki.backend.service.AiService;
import mk.ukim.finki.backend.service.QuizService;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class QuizServiceImpl implements QuizService {

    private final DocumentRepository documentRepository;
    private final QuizRepository quizRepository;
    private final AiService aiService;

    @Override
    public Quiz generateAndSaveQuiz(Long fileId, Long userId) throws IOException {
        Document document = documentRepository.findByIdAndUserId(fileId, userId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        String text = aiService.extractTextFromDocument(document.getFileUrl());
        String quizJson = aiService.generateQuiz(text);

        ObjectMapper mapper = new ObjectMapper();
        List<Map<String, Object>> quizData = mapper.readValue(quizJson, List.class);

        Quiz quiz = new Quiz();
        quiz.setDocument(document);
        quiz.setTitle("Quiz for " + document.getFileName());

        List<Question> questions = new ArrayList<>();
        for (Map<String, Object> item : quizData) {
            Question q = new Question();
            q.setQuestionText((String) item.get("question"));
            q.setOptions((List<String>) item.get("options"));
            q.setCorrectAnswer((String) item.get("correctAnswer"));
            q.setQuiz(quiz);
            questions.add(q);
        }

        quiz.setQuestions(questions);
        return quizRepository.save(quiz);
    }

    @Override
    public Quiz getQuiz(Long fileId, Long userId) {
        return quizRepository.findByDocumentIdAndDocumentUserId(fileId, userId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));
    }

    @Override
    public void deleteQuiz(Long fileId) {
        quizRepository.deleteByDocumentId(fileId);
    }
}
