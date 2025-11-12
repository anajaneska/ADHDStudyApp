package mk.ukim.finki.backend.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import mk.ukim.finki.backend.service.AiService;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;

@Service
public class AiServiceImpl implements AiService {
    @Value("${huggingface.api.key}")
    private String HUGGING_FACE_API_TOKEN;
    private static final String MODEL_URL_SUMMARIZE = "https://router.huggingface.co/hf-inference/models/sshleifer/distilbart-cnn-12-6";
    private static final String MODEL_URL_FLASHCARDS = "https://router.huggingface.co/v1/chat/completions";
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
            return Files.readString(Paths.get(filePath));
        }
    }

    @Override
    public String summarize(String text) throws IOException {
        if (text == null || text.isBlank()) return "";
        List<String> chunks = splitTextIntoChunks(text, 700);
        StringBuilder combined = new StringBuilder();

        for (String chunk : chunks) {
            String resp = callHuggingFaceApi(chunk, MODEL_URL_SUMMARIZE);
            combined.append(resp).append(" ");
        }

        String combinedText = combined.toString().trim();
        if (combinedText.length() > 1500) {
            return callHuggingFaceApi(combinedText,MODEL_URL_SUMMARIZE);
        }
        return combinedText;
    }

    @Override
    public String generateFlashcards(String text) throws IOException {
        String modelUrl = MODEL_URL_FLASHCARDS;

        String prompt = """
        Generate 5 educational flashcards based on the following text. 
        Return them as a valid JSON array of objects with 'question' and 'answer' fields. 
        Text: %s
        """.formatted(text);

        ObjectMapper mapper = new ObjectMapper();

        Map<String, Object> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", prompt);

        Map<String, Object> body = new HashMap<>();
        body.put("model", MODEL_URL_FLASHCARDS);
        body.put("messages", List.of(message));
        body.put("stream", false);

        String payload = mapper.writeValueAsString(body);

        URL url = new URL(modelUrl);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("POST");
        connection.setRequestProperty("Authorization", "Bearer " + HUGGING_FACE_API_TOKEN);
        connection.setRequestProperty("Content-Type", "application/json");
        connection.setDoOutput(true);

        try (OutputStream os = connection.getOutputStream()) {
            os.write(payload.getBytes(StandardCharsets.UTF_8));
        }

        int responseCode = connection.getResponseCode();
        String response;
        if (responseCode == 200) {
            response = new String(connection.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        } else {
            String err = new String(connection.getErrorStream().readAllBytes(), StandardCharsets.UTF_8);
            throw new IOException("Hugging Face API returned error: " + responseCode + " - " + err);
        }

        JsonNode root = mapper.readTree(response);
        String generatedText = root.path("choices").get(0).path("message").path("content").asText();

        if (!generatedText.trim().startsWith("[")) {
            generatedText = generatedText.substring(generatedText.indexOf("[")); // crude fix
        }

        return generatedText;
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
    @Override
    public String generateQuiz(String text) throws IOException {
        // Model endpoint for Hugging Face chat completion
        String modelUrl = MODEL_URL_FLASHCARDS;

        // Use a Hugging Face model capable of structured text generation
        String modelName = "meta-llama/Llama-3.1-8B-Instruct"; // or another chat-capable model you prefer

        String prompt = """
        Create a quiz with 5 multiple-choice questions (A-D) based on the following text. 
        Return them as a valid JSON array of objects with 'question', 'options', and 'correctAnswer' fields.
        Text: %s
        """.formatted(text);

        ObjectMapper mapper = new ObjectMapper();

        Map<String, Object> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", prompt);

        Map<String, Object> body = new HashMap<>();
        body.put("model", modelName); // ✅ Use modelName instead of missing constant
        body.put("messages", List.of(message));
        body.put("stream", false);

        String payload = mapper.writeValueAsString(body);

        URL url = new URL(modelUrl);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("POST");
        connection.setRequestProperty("Authorization", "Bearer " + HUGGING_FACE_API_TOKEN);
        connection.setRequestProperty("Content-Type", "application/json");
        connection.setDoOutput(true);

        try (OutputStream os = connection.getOutputStream()) {
            os.write(payload.getBytes(StandardCharsets.UTF_8));
        }

        int responseCode = connection.getResponseCode();
        String response;
        if (responseCode == 200) {
            response = new String(connection.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        } else {
            String err = new String(connection.getErrorStream().readAllBytes(), StandardCharsets.UTF_8);
            throw new IOException("Hugging Face API returned error: " + responseCode + " - " + err);
        }

        JsonNode root = mapper.readTree(response);
        String generatedText = root.path("choices").get(0).path("message").path("content").asText();

        if (!generatedText.trim().startsWith("[")) {
            generatedText = generatedText.substring(generatedText.indexOf("[")); // crude fix if model returns extra text
        }

        return generatedText;
    }



}

