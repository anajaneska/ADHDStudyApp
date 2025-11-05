package mk.ukim.finki.backend.service.impl;

import mk.ukim.finki.backend.service.AiService;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

@Service
public class AiServiceImpl implements AiService {
    @Value("${huggingface.api.key}")
    private String HUGGING_FACE_API_TOKEN;
    private static final String MODEL_URL_SUMMARIZE = "https://router.huggingface.co/hf-inference/models/sshleifer/distilbart-cnn-12-6";
    private static final String MODEL_URL_FLASHCARDS = "https://router.huggingface.co/hf-inference/models/google/flan-t5-large";
    @Override
    public String extractTextFromDocument(String filePath) throws IOException {
        if (filePath == null) return "";

        String lower = filePath.toLowerCase();
        if (lower.endsWith(".txt")) {
            return Files.readString(Paths.get(filePath));
        } else if (lower.endsWith(".pdf")) {
            try (PDDocument document = PDDocument.load(new File(filePath))) {
                PDFTextStripper stripper = new PDFTextStripper();
                return stripper.getText(document);
            }
        } else if (lower.endsWith(".docx")) {
            try (FileInputStream fis = new FileInputStream(filePath);
                 XWPFDocument doc = new XWPFDocument(fis)) {

                StringBuilder sb = new StringBuilder();
                for (XWPFParagraph p : doc.getParagraphs()) {
                    sb.append(p.getText()).append("\n");
                }
                return sb.toString();
            }
        } else {
            // fallback: try to read bytes as UTF-8 text
            return Files.readString(Paths.get(filePath));
        }
    }

    @Override
    public String summarize(String text) throws IOException {
        if (text == null || text.isBlank()) return "";
        // optional: chunk large text before sending
        List<String> chunks = splitTextIntoChunks(text, 700);
        StringBuilder combined = new StringBuilder();

        for (String chunk : chunks) {
            String resp = callHuggingFaceApi(chunk, MODEL_URL_SUMMARIZE);
            combined.append(resp).append(" ");
        }

        String combinedText = combined.toString().trim();
        // If combined is long, request a final single-pass summarization
        if (combinedText.length() > 1500) {
            return callHuggingFaceApi(combinedText,MODEL_URL_SUMMARIZE);
        }
        return combinedText;
    }

    @Override
    public String generateFlashcards(String text) throws IOException {
        if (text == null || text.isBlank()) return "";

        String prompt = "Generate 5 concise flashcards from the text. " +
                "Return them as plain text in this format:\n" +
                "Q: <question>\nA: <answer>\n\n" +
                "Text:\n" + text;

        // If text is huge, send chunks or a trimmed portion. Here we send whole prompt.
        return callHuggingFaceApi(prompt, MODEL_URL_FLASHCARDS);
    }


    public List<String> splitTextIntoChunks(String text, int maxWords) {
        String[] words = text.split("\\s+");
        List<String> chunks = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        int count = 0;

        for (String word : words) {
            current.append(word).append(" ");
            count++;
            if (count >= maxWords) {
                chunks.add(current.toString().trim());
                current = new StringBuilder();
                count = 0;
            }
        }
        if (current.length() > 0) chunks.add(current.toString().trim());
        return chunks;
    }

    public String callHuggingFaceApi(String text,String MODEL_URL) throws IOException {
        URL url = new URL(MODEL_URL);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();

        connection.setRequestMethod("POST");
        connection.setRequestProperty("Authorization", "Bearer " + HUGGING_FACE_API_TOKEN);
        connection.setRequestProperty("Content-Type", "application/json");
        connection.setDoOutput(true);

        // Build the JSON payload. Make sure to escape quotes.
        String jsonInput = "{\"inputs\": " + toJsonString(text) + "}";

        try (OutputStream os = connection.getOutputStream()) {
            os.write(jsonInput.getBytes());
        }

        int responseCode = connection.getResponseCode();
        if (responseCode != 200) {
            String err = new String(connection.getErrorStream().readAllBytes());
            throw new IOException("HF API returned error: " + responseCode + " - " + err);
        }

        String response = new String(connection.getInputStream().readAllBytes());
        // Try to parse summary_text; fallback to returning full response
        return parseModelResponse(response);
    }

    public String toJsonString(String text) {
        return "\"" + text.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") + "\"";
    }


    public String parseModelResponse(String jsonResponse) {
        if (jsonResponse == null) return "";
        String lower = jsonResponse.toLowerCase();
        if (lower.contains("\"summary_text\"")) {
            int idx = jsonResponse.indexOf("\"summary_text\"");
            int start = jsonResponse.indexOf(":", idx) + 1;
            // find first quote after colon
            int q1 = jsonResponse.indexOf("\"", start);
            int q2 = jsonResponse.indexOf("\"", q1 + 1);
            if (q1 >= 0 && q2 > q1) {
                return jsonResponse.substring(q1 + 1, q2);
            }
        }
        if (jsonResponse.startsWith("[") && jsonResponse.endsWith("]")) {
            String inner = jsonResponse.substring(1, jsonResponse.length() - 1).trim();
            if (inner.startsWith("\"") && inner.endsWith("\"")) {
                return inner.substring(1, inner.length() - 1);
            }
            return inner;
        }
        return jsonResponse;
    }
}

