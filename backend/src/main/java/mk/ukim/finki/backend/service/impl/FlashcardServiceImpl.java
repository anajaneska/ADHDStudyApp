package mk.ukim.finki.backend.service.impl;


import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import mk.ukim.finki.backend.model.Document;
import mk.ukim.finki.backend.model.Flashcards;
import mk.ukim.finki.backend.repository.DocumentRepository;
import mk.ukim.finki.backend.repository.FlashcardRepository;
import mk.ukim.finki.backend.service.AiService;
import mk.ukim.finki.backend.service.FlashcardService;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@RequiredArgsConstructor
@Transactional
public class FlashcardServiceImpl implements FlashcardService {

    private final DocumentRepository documentRepository;
    private final FlashcardRepository flashcardRepository;
    private final AiService aiService;

    @Override
    public Flashcards generateAndSaveFlashcards(Long fileId, Long userId) throws IOException {
        Document document = documentRepository.findByIdAndUserId(fileId, userId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        String text = aiService.extractTextFromDocument(document.getFileUrl());
        String flashcardJson = aiService.generateFlashcards(text); // JSON string

        Flashcards flashcards = new Flashcards();
        flashcards.setDocument(document);
        flashcards.setFlashcardData(flashcardJson);
        flashcards.setNumberOfFlashcards(10);

        return flashcardRepository.save(flashcards);
    }

    @Override
    public Flashcards getFlashcards(Long fileId, Long userId) {
        return flashcardRepository.findByDocumentIdAndDocumentUserId(fileId, userId)
                .orElseThrow(() -> new RuntimeException("Flashcards not found"));
    }
    @Override
    @Transactional
    public void deleteFlashcards(Long documentId) {
        flashcardRepository.deleteByDocumentId(documentId);
    }
}
