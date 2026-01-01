package mk.ukim.finki.backend.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import mk.ukim.finki.backend.model.Document;
import mk.ukim.finki.backend.model.Flashcards;
import mk.ukim.finki.backend.model.exeptions.DocumentDoesNotExistException;
import mk.ukim.finki.backend.model.exeptions.FlashcardsDoNotExistException;
import mk.ukim.finki.backend.repository.DocumentRepository;
import mk.ukim.finki.backend.repository.FlashcardRepository;
import mk.ukim.finki.backend.service.FlashcardService;
import mk.ukim.finki.backend.service.impl.AiServiceImpl.ExtractTextService;
import mk.ukim.finki.backend.service.impl.AiServiceImpl.GeminiAIService;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@RequiredArgsConstructor
@Transactional
public class FlashcardServiceImpl implements FlashcardService {

    private final DocumentRepository documentRepository;
    private final FlashcardRepository flashcardRepository;
    private final GeminiAIService geminiAIService;
    private final ExtractTextService extractTextService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public Flashcards generateAndSaveFlashcards(Long documentId, Long userId) throws IOException {
        // Fetch document for user
        Document document = documentRepository
                .findByIdAndUserId(documentId, userId)
                .orElseThrow(() -> new DocumentDoesNotExistException(documentId));

        String text = extractTextService.loadFileText(document);

        // Generate raw flashcards from AI
        String rawFlashcardJson = geminiAIService.generateFlashcards(text);

        // Clean the AI output to extract only JSON array
        String flashcardJson = extractJsonArray(rawFlashcardJson);

        // Parse JSON and count flashcards
        JsonNode flashcardsArray;
        try {
            flashcardsArray = objectMapper.readTree(flashcardJson);
            if (!flashcardsArray.isArray()) {
                throw new IOException("AI did not return a JSON array of flashcards");
            }
        } catch (IOException e) {
            throw new IOException("Failed to parse AI flashcards JSON: " + e.getMessage(), e);
        }

        Flashcards flashcards = new Flashcards();
        flashcards.setDocument(document);
        flashcards.setFlashcardData(flashcardJson);
        flashcards.setNumberOfFlashcards(flashcardsArray.size());

        return flashcardRepository.save(flashcards);
    }

    @Override
    public Flashcards getFlashcards(Long fileId, Long userId) {
        return flashcardRepository.findByDocumentIdAndDocumentUserId(fileId, userId)
                .orElseThrow(() -> new FlashcardsDoNotExistException(fileId));
    }

    @Override
    public void deleteFlashcards(Long documentId) {
        flashcardRepository.deleteByDocumentId(documentId);
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
