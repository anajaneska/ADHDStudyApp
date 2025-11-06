package mk.ukim.finki.backend.service;

import mk.ukim.finki.backend.model.Summary;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.io.IOException;

public interface SummaryService {
    Summary generateAndSaveSummary(Long fileId, Long userId) throws IOException;
    Summary getSummary(Long fileId, Long userId);
    @Modifying
    @Query("DELETE FROM Summary s WHERE s.document.id = :documentId")
    void deleteSummary(@Param("documentId") Long documentId);
}