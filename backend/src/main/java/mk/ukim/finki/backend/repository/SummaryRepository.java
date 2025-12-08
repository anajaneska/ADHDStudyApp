package mk.ukim.finki.backend.repository;

import jakarta.transaction.Transactional;
import mk.ukim.finki.backend.model.Summary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SummaryRepository extends JpaRepository<Summary, Long> {
    Optional<Summary> findByDocumentIdAndDocumentUserId(Long fileId, Long userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Summary s WHERE s.document.id = :documentId")
    void deleteByDocumentId(@Param("documentId") Long documentId);
}
