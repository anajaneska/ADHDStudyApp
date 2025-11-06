package mk.ukim.finki.backend.service;

import mk.ukim.finki.backend.model.Flashcards;

import java.io.IOException;

public interface FlashcardService {
    Flashcards generateAndSaveFlashcards(Long fileId, Long userId) throws IOException;
    Flashcards getFlashcards(Long fileId, Long userId);
    void deleteFlashcards(Long fileId);
}