package mk.ukim.finki.backend.repository;

import mk.ukim.finki.backend.model.Summary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SummaryRepository extends JpaRepository<Summary, Long> {
    Optional<Summary> findByDocumentIdAndDocumentUserId(Long fileId, Long userId);

    void deleteByDocumentId(Long documentId);
}
