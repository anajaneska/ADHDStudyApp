package mk.ukim.finki.backend.service.impl;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.backend.model.Document;
import mk.ukim.finki.backend.model.Summary;
import mk.ukim.finki.backend.repository.DocumentRepository;
import mk.ukim.finki.backend.repository.SummaryRepository;
import mk.ukim.finki.backend.service.AiService;
import mk.ukim.finki.backend.service.SummaryService;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class SummaryServiceImpl implements SummaryService {

    private final DocumentRepository documentRepository;
    private final SummaryRepository summaryRepository;
    private final AiService aiService;

    @Override
    public Summary generateAndSaveSummary(Long fileId, Long userId) throws IOException {
        Document document = documentRepository.findByIdAndUserId(fileId, userId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        String text = aiService.extractTextFromDocument(document.getFileUrl());
        String summaryText = aiService.summarize(text);

        Summary summary = new Summary();
        summary.setDocument(document);
        summary.setContent(summaryText);

        return summaryRepository.save(summary);
    }

    @Override
    public Summary getSummary(Long fileId, Long userId) {
        return summaryRepository.findByDocumentIdAndDocumentUserId(fileId, userId)
                .orElseThrow(() -> new RuntimeException("Summary not found"));
    }
}
