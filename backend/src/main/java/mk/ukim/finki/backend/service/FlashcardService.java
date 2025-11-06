package mk.ukim.finki.backend.service;

import mk.ukim.finki.backend.model.Flashcards;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.io.IOException;

public interface FlashcardService {
    Flashcards generateAndSaveFlashcards(Long fileId, Long userId) throws IOException;
    Flashcards getFlashcards(Long fileId, Long userId);
    @Modifying
    @Query("DELETE FROM Flashcards f WHERE f.document.id = :documentId")
    void deleteFlashcards(@Param("documentId") Long documentId);
}