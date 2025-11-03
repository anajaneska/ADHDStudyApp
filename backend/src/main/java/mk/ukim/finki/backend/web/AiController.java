package mk.ukim.finki.backend.web;

import mk.ukim.finki.backend.service.AiService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.*;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.*;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Value("${huggingface.api.key}")
    private String HUGGING_FACE_API_TOKEN;
    private static final String MODEL_URL = "https://router.huggingface.co/hf-inference/models/sshleifer/distilbart-cnn-12-6";
    private AiService aiService;
    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    // Upload endpoint
    @PostMapping(value = "/summarize", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String text = aiService.extractText(file);

            if (text == null || text.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Could not extract text from file"));
            }

            String summary = aiService.summarizeTextSafely(text,MODEL_URL,HUGGING_FACE_API_TOKEN);
            return ResponseEntity.ok(Map.of("summary", summary));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
