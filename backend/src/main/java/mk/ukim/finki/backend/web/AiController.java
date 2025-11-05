package mk.ukim.finki.backend.web;

import mk.ukim.finki.backend.service.AiService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;
import java.util.*;


@RestController
@RequestMapping("/api/ai")
public class AiController {

//    private AiService aiService;
//    public AiController(AiService aiService) {
//        this.aiService = aiService;
//    }
//
//    // Upload endpoint
//    @PostMapping(value = "/summarize", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
//        try {
//            String text = aiService.extractTextFromDocument(file);
//
//            if (text == null || text.isBlank()) {
//                return ResponseEntity.badRequest().body(Map.of("error", "Could not extract text from file"));
//            }
//
//            String summary = aiService.summarizeTextSafely(text);
//            return ResponseEntity.ok(Map.of("summary", summary));
//
//        } catch (Exception e) {
//            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
//        }
//    }
//
//
//    //FOR FLASHCARDS
//    @PostMapping("/flashcards")
//    public ResponseEntity<Map<String, String>> generateFlashcards(@RequestBody Map<String, String> payload) {
//        String text = payload.get("text");
//        if (text == null || text.isBlank()) {
//            return ResponseEntity.badRequest().body(Map.of("error", "No text provided"));
//        }
//
//        try {
//            String flashcards = aiService.generateFlashcards(text);
//            return ResponseEntity.ok(Map.of("flashcards", flashcards));
//        } catch (Exception e) {
//            e.printStackTrace();
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body(Map.of("error", "Failed to generate flashcards"));
//        }
//    }
}
