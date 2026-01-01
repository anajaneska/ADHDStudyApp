package mk.ukim.finki.backend.service.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import mk.ukim.finki.backend.model.Document;
import mk.ukim.finki.backend.model.Summary;

import mk.ukim.finki.backend.model.exeptions.DocumentDoesNotExistException;
import mk.ukim.finki.backend.model.exeptions.SummaryDoesNotExistException;
import mk.ukim.finki.backend.repository.DocumentRepository;
import mk.ukim.finki.backend.repository.SummaryRepository;
import mk.ukim.finki.backend.service.SummaryService;
import mk.ukim.finki.backend.service.impl.AiServiceImpl.ExtractTextService;
import mk.ukim.finki.backend.service.impl.AiServiceImpl.GeminiAIService;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class SummaryServiceImpl implements SummaryService {

    private final DocumentRepository documentRepository;
    private final SummaryRepository summaryRepository;
    private final GeminiAIService geminiAIService;
    private final ExtractTextService extractTextService;



    public Summary generateAndSaveSummary(Long documentId, Long userId) throws IOException {

        Document document = documentRepository
                .findByIdAndUserId(documentId, userId)
                .orElseThrow(() -> new DocumentDoesNotExistException(documentId));

        String text = extractTextService.loadFileText(document);

        String summaryText = geminiAIService.summarize(text);

        if (summaryText == null || summaryText.isBlank()) {
            throw new RuntimeException("Gemini summarization failed");
        }

        Summary summary = document.getSummary();
        if (summary == null) {
            summary = new Summary();
            summary.setDocument(document);
            document.setSummary(summary);
        }

        summary.setContent(summaryText);
        documentRepository.save(document);

        return summary;
    }


    public Summary getSummary(Long fileId, Long userId) {
        return summaryRepository
                .findByDocumentIdAndDocumentUserId(fileId, userId)
                .orElseThrow(() -> new SummaryDoesNotExistException(fileId));
    }

    @Transactional
    public void deleteSummary(Long fileId) {
        summaryRepository.deleteByDocumentId(fileId);
    }
}

