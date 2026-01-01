package mk.ukim.finki.backend.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import mk.ukim.finki.backend.model.Document;
import mk.ukim.finki.backend.model.Quiz;
import mk.ukim.finki.backend.model.Question;
import mk.ukim.finki.backend.model.exeptions.DocumentDoesNotExistException;
import mk.ukim.finki.backend.model.exeptions.QuizDoesNotExistException;
import mk.ukim.finki.backend.repository.DocumentRepository;
import mk.ukim.finki.backend.repository.QuestionRepository;
import mk.ukim.finki.backend.repository.QuizRepository;
import mk.ukim.finki.backend.service.QuizService;
import mk.ukim.finki.backend.service.impl.AiServiceImpl.ExtractTextService;
import mk.ukim.finki.backend.service.impl.AiServiceImpl.GeminiAIService;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class QuizServiceImpl implements QuizService {

    private final DocumentRepository documentRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final GeminiAIService geminiAIService;
    private final ExtractTextService extractTextService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public Quiz generateAndSaveQuiz(Long documentId, Long userId) throws IOException {
        // Fetch document
        Document document = documentRepository
                .findByIdAndUserId(documentId, userId)
                .orElseThrow(() -> new DocumentDoesNotExistException(documentId));

        String text = extractTextService.loadFileText(document);

        // Generate raw quiz JSON from AI
        String rawQuizJson = geminiAIService.generateQuiz(text);

        // Clean AI output to extract only JSON array
        String quizJson = extractJsonArray(rawQuizJson);

        // Parse JSON into questions
        JsonNode quizArray;
        try {
            quizArray = objectMapper.readTree(quizJson);
            if (!quizArray.isArray()) {
                throw new IOException("AI did not return a JSON array of quiz questions");
            }
        } catch (IOException e) {
            throw new IOException("Failed to parse AI quiz JSON: " + e.getMessage(), e);
        }

        Quiz quiz = new Quiz();
        quiz.setDocument(document);
        quiz.setTitle("Quiz for " + document.getFileName());

        List<Question> questions = new ArrayList<>();
        for (JsonNode item : quizArray) {
            Question q = new Question();
            q.setQuestionText(item.get("question").asText());

            // Options as array
            List<String> options = new ArrayList<>();
            for (JsonNode opt : item.get("options")) {
                options.add(opt.asText());
            }
            q.setOptions(options);
            q.setCorrectAnswer(item.get("correctAnswer").asText());
            q.setQuiz(quiz);
            questions.add(q);
        }

        quiz.setQuestions(questions);
        return quizRepository.save(quiz);
    }

    @Override
    public Quiz getQuiz(Long fileId, Long userId) {
        return quizRepository.findByDocumentIdAndDocumentUserId(fileId, userId)
                .orElseThrow(() -> new QuizDoesNotExistException(fileId));
    }

    @Override
    public void deleteQuiz(Long documentId) {
        Quiz quiz = quizRepository.findByDocumentId(documentId)
                .orElseThrow(() -> new QuizDoesNotExistException(documentId));

        Long quizId = quiz.getId();
        questionRepository.deleteByQuizId(quizId);
        quizRepository.deleteByDocumentId(documentId);
    }

    /**
     * Extracts a JSON array from AI output by trimming everything before the first '['
     * and after the last ']'. This removes backticks or extra explanations.
     */
    private String extractJsonArray(String text) throws IOException {
        int start = text.indexOf("[");
        int end = text.lastIndexOf("]");
        if (start == -1 || end == -1 || end <= start) {
            throw new IOException("Could not find JSON array in AI output");
        }
        return text.substring(start, end + 1);
    }
}
