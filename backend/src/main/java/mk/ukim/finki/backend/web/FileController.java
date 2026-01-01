package mk.ukim.finki.backend.web;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.backend.model.*;

import mk.ukim.finki.backend.service.FileService;
import mk.ukim.finki.backend.service.FlashcardService;
import mk.ukim.finki.backend.service.QuizService;
import mk.ukim.finki.backend.service.SummaryService;
import mk.ukim.finki.backend.service.impl.SummaryServiceImpl;
import org.springframework.http.ResponseEntity;
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
    private final QuizService quizService;


    //FILE SERVICE
    @PostMapping("/{userId}/upload")
    public ResponseEntity<Document> uploadFile(@RequestParam("file") MultipartFile file, @PathVariable Long userId) {
        Document document = fileService.uploadFile(file, userId);
        return ResponseEntity.ok(document);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<Document>> getUserFiles(@PathVariable Long userId) {
        return ResponseEntity.ok(fileService.getUserFiles(userId));
    }
    @DeleteMapping("/{userId}/{fileId}")
    public ResponseEntity<Void> deleteFile(@PathVariable Long userId, @PathVariable Long fileId) {
        fileService.deleteFile(fileId, userId);
        return ResponseEntity.noContent().build();
    }

    //SUMMARY SERVICE
    @PostMapping("/{userId}/{fileId}/summarize")
    public ResponseEntity<Summary> summarizeFile(@PathVariable Long userId, @PathVariable Long fileId) throws IOException {
        Summary summary = summaryService.generateAndSaveSummary(fileId, userId);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/{userId}/{fileId}/summary")
    public ResponseEntity<Summary> getSummary(@PathVariable Long userId, @PathVariable Long fileId) {
        return ResponseEntity.ok(summaryService.getSummary(fileId,userId));
    }
    @DeleteMapping("/{fileId}/summary")
    public ResponseEntity<Void> deleteSummary(@PathVariable Long fileId) {
        summaryService.deleteSummary(fileId);
        return ResponseEntity.noContent().build();
    }

    //FLASHCARD SERVICE
    @PostMapping("/{userId}/{fileId}/flashcards")
    public ResponseEntity<Flashcards> generateFlashcards(@PathVariable Long userId, @PathVariable Long fileId) throws IOException {
        Flashcards flashcards = flashcardService.generateAndSaveFlashcards(fileId,userId);
        return ResponseEntity.ok(flashcards);
    }

    @GetMapping("/{userId}/{fileId}/flashcards")
    public ResponseEntity<Flashcards> getFlashcards(@PathVariable Long userId, @PathVariable Long fileId) {
        return ResponseEntity.ok(flashcardService.getFlashcards(fileId, userId));
    }

    @DeleteMapping("/{fileId}/flashcards")
    public ResponseEntity<Void> deleteFlashcards(@PathVariable Long fileId) {
        flashcardService.deleteFlashcards(fileId);
        return ResponseEntity.noContent().build();
    }

    //QUIZ SERVICE
    @PostMapping("/{userId}/{fileId}/quiz")
    public ResponseEntity<Quiz> generateQuiz(@PathVariable Long userId, @PathVariable Long fileId) throws IOException {
        Quiz quiz = quizService.generateAndSaveQuiz(fileId, userId);
        return ResponseEntity.ok(quiz);
    }

    @GetMapping("/{userId}/{fileId}/quiz")
    public ResponseEntity<Quiz> getQuiz(@PathVariable Long userId, @PathVariable Long fileId) {
        Quiz quiz = quizService.getQuiz(fileId, userId);
        return ResponseEntity.ok(quiz);
    }
    @DeleteMapping("/{fileId}/quiz")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long fileId) {
        quizService.deleteQuiz(fileId);
        return ResponseEntity.noContent().build();
    }

}
