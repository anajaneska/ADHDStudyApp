package mk.ukim.finki.backend.repository;

import mk.ukim.finki.backend.model.Flashcards;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FlashcardRepository extends JpaRepository<Flashcards, Long> {
    Optional<Flashcards> findByDocumentIdAndDocumentUserId(Long fileId, Long userId);

    void deleteByDocumentId(Long documentId);
}
