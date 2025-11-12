package mk.ukim.finki.backend.repository;

import mk.ukim.finki.backend.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    Optional<Quiz> findByDocumentIdAndDocumentUserId(Long documentId, Long userId);
    void deleteByDocumentId(Long documentId);
}
