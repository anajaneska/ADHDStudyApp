package mk.ukim.finki.backend.repository;

import jakarta.transaction.Transactional;
import mk.ukim.finki.backend.model.Flashcards;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FlashcardRepository extends JpaRepository<Flashcards, Long> {
    Optional<Flashcards> findByDocumentIdAndDocumentUserId(Long fileId, Long userId);
    @Modifying
    @Transactional
    @Query("DELETE FROM Flashcards s WHERE s.document.id = :documentId")
    void deleteByDocumentId(@Param("documentId") Long documentId);
}
