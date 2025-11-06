package mk.ukim.finki.backend.web;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.backend.model.Document;
import mk.ukim.finki.backend.model.Flashcards;
import mk.ukim.finki.backend.model.Summary;

import mk.ukim.finki.backend.model.UserPrincipal;
import mk.ukim.finki.backend.service.FileService;
import mk.ukim.finki.backend.service.FlashcardService;
import mk.ukim.finki.backend.service.SummaryService;
import mk.ukim.finki.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class FileController {

    private final FileService fileService;
    private final SummaryService summaryService;
    private final FlashcardService flashcardService;

    @PostMapping("/{userId}/upload")
    public ResponseEntity<Document> uploadFile(@RequestParam("file") MultipartFile file, @PathVariable Long userId) {
        Document document = fileService.uploadFile(file, userId);
        return ResponseEntity.ok(document);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<Document>> getUserFiles(@PathVariable Long userId) {
        return ResponseEntity.ok(fileService.getUserFiles(userId));
    }

    @PostMapping("/{userId}/{fileId}/summarize")
    public ResponseEntity<Summary> summarizeFile(@PathVariable Long fileId, @PathVariable Long userId) throws IOException {
        Summary summary = summaryService.generateAndSaveSummary(fileId, userId);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/{userId}/{fileId}/summary")
    public ResponseEntity<Summary> getSummary(@PathVariable Long fileId, @PathVariable Long userId) {
        return ResponseEntity.ok(summaryService.getSummary(fileId,userId));
    }

    @PostMapping("/{userId}/{fileId}/flashcards")
    public ResponseEntity<Flashcards> generateFlashcards(@PathVariable Long fileId, @PathVariable Long userId) throws IOException {
        Flashcards flashcards = flashcardService.generateAndSaveFlashcards(fileId,userId);
        return ResponseEntity.ok(flashcards);
    }

    @GetMapping("/{userId}/{fileId}/flashcards")
    public ResponseEntity<Flashcards> getFlashcards(@PathVariable Long fileId, @PathVariable Long userId) {
        return ResponseEntity.ok(flashcardService.getFlashcards(fileId, userId));
    }
    @DeleteMapping("/{userId}/{fileId}")
    public ResponseEntity<Void> deleteFile(@PathVariable Long fileId, @PathVariable Long userId) {
        fileService.deleteFile(fileId, userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{fileId}/summary")
    public ResponseEntity<Void> deleteSummary(@PathVariable Long fileId) {
        summaryService.deleteSummary(fileId);
        return ResponseEntity.noContent().build();
    }
    @DeleteMapping("/{fileId}/flashcards")
    public ResponseEntity<Void> deleteFlashcards(@PathVariable Long fileId) {
        flashcardService.deleteFlashcards(fileId);
        return ResponseEntity.noContent().build();
    }

}
