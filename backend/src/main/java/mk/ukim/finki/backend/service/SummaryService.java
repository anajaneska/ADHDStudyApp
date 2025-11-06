package mk.ukim.finki.backend.service;

import mk.ukim.finki.backend.model.Summary;

import java.io.IOException;

public interface SummaryService {
    Summary generateAndSaveSummary(Long fileId, Long userId) throws IOException;
    Summary getSummary(Long fileId, Long userId);
    void deleteSummary(Long fileId);
}