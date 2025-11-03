package mk.ukim.finki.backend.service.impl;

import mk.ukim.finki.backend.service.AiService;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

@Service
public class AiServiceImpl implements AiService {

    // Extract text based on file type
    @Override
    public String extractText(MultipartFile file) throws IOException {
        String fileName = file.getOriginalFilename();
        if (fileName == null) return null;

        if (fileName.endsWith(".txt")) {
            return new String(file.getBytes());
        } else if (fileName.endsWith(".pdf")) {
            try (PDDocument document = PDDocument.load(file.getInputStream())) {
                PDFTextStripper stripper = new PDFTextStripper();
                return stripper.getText(document);
            }
        } else if (fileName.endsWith(".docx")) {
            try (XWPFDocument doc = new XWPFDocument(file.getInputStream())) {
                StringBuilder sb = new StringBuilder();
                for (XWPFParagraph p : doc.getParagraphs()) {
                    sb.append(p.getText()).append("\n");
                }
                return sb.toString();
            }
        }
        return null;
    }

    // Safely summarize large text
    @Override
    public String summarizeTextSafely(String text,String MODEL_URL, String HUGGING_FACE_API_TOKEN) throws IOException {
        List<String> chunks = splitTextIntoChunks(text, 700);
        StringBuilder combined = new StringBuilder();

        for (String chunk : chunks) {
            try {
                String partial = callHuggingFaceApi(chunk,MODEL_URL,HUGGING_FACE_API_TOKEN);
                combined.append(partial).append(" ");
            } catch (IOException e) {
                // If one chunk fails, skip it
                System.err.println("Chunk failed: " + e.getMessage());
            }
        }

        String combinedText = combined.toString().trim();
        if (combinedText.length() > 1000) {
            // Summarize summaries again
            return callHuggingFaceApi(combinedText,MODEL_URL,HUGGING_FACE_API_TOKEN);
        }
        return combinedText;
    }

    // Split text into safe chunks
    @Override
    public List<String> splitTextIntoChunks(String text, int maxWords) {
        String[] words = text.split("\\s+");
        List<String> chunks = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        int count = 0;

        for (String word : words) {
            current.append(word).append(" ");
            count++;
            if (count >= maxWords) {
                chunks.add(current.toString());
                current = new StringBuilder();
                count = 0;
            }
        }

        if (!current.isEmpty()) {
            chunks.add(current.toString());
        }

        return chunks;
    }

    // Call Hugging Face API
    @Override
    public String callHuggingFaceApi(String text, String MODEL_URL, String HUGGING_FACE_API_TOKEN) throws IOException {
        URL url = new URL(MODEL_URL);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();

        connection.setRequestMethod("POST");
        connection.setRequestProperty("Authorization", "Bearer " + HUGGING_FACE_API_TOKEN);
        connection.setRequestProperty("Content-Type", "application/json");
        connection.setDoOutput(true);

        String jsonInput = "{\"inputs\": " + toJsonString(text) + "}";

        try (OutputStream os = connection.getOutputStream()) {
            os.write(jsonInput.getBytes());
        }

        int responseCode = connection.getResponseCode();
        if (responseCode != 200) {
            String errorMsg = new String(connection.getErrorStream().readAllBytes());
            throw new IOException("HF API returned error: " + responseCode + " - " + errorMsg);
        }

        String response = new String(connection.getInputStream().readAllBytes());
        return parseSummary(response);
    }

    // Escape JSON safely
    @Override
    public String toJsonString(String text) {
        return "\"" + text.replace("\"", "\\\"").replace("\n", "\\n") + "\"";
    }

    // Extract summarized text from response JSON
    @Override
    public String parseSummary(String jsonResponse) {
        if (jsonResponse.contains("\"summary_text\"")) {
            int start = jsonResponse.indexOf("\"summary_text\":\"") + 17;
            int end = jsonResponse.indexOf("\"", start);
            return jsonResponse.substring(start, end);
        }
        return jsonResponse;
    }
}
