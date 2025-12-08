package mk.ukim.finki.backend.service.impl.AiServiceImpl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class SummaryServiceHF {

    private static final String MODEL_URL =
            "https://router.huggingface.co/hf-inference/models/sshleifer/distilbart-cnn-12-6";

    private final HttpClientHF http;
    private final ObjectMapper mapper = new ObjectMapper();

    public SummaryServiceHF(HttpClientHF http) {
        this.http = http;
    }

    public String summarize(String text) throws IOException {
        if (text == null || text.isBlank()) {
            System.out.println("Input text is null or empty.");
            return "";
        }

        // Safe token-aware chunking: max 800 tokens per chunk
        List<String> chunks = splitByTokensSafe(text, 800);
        System.out.println("Text split into " + chunks.size() + " safe token-aware chunks.");

        StringBuilder result = new StringBuilder();

        for (int i = 0; i < chunks.size(); i++) {
            String chunk = chunks.get(i);
            System.out.println("Processing chunk " + (i + 1) + "/" + chunks.size() + " (length: " + chunk.length() + ")");
            try {
                String resp = callModel(chunk);
                result.append(resp).append(" ");
            } catch (Exception e) {
                System.err.println("Failed to summarize chunk " + (i + 1) + ": " + e.getMessage());
            }
        }

        String combined = result.toString().trim();
        System.out.println("Combined summary length: " + combined.length());

        // Re-summarize if combined summary is too long
        if (combined.length() > 1500) {
            System.out.println("Combined summary too long, summarizing again in smaller chunks...");
            List<String> subChunks = splitByTokensSafe(combined, 500);
            StringBuilder finalSummary = new StringBuilder();
            for (String sc : subChunks) {
                try {
                    finalSummary.append(callModel(sc)).append(" ");
                } catch (Exception e) {
                    System.err.println("Failed to summarize sub-chunk: " + e.getMessage());
                }
            }
            return finalSummary.toString().trim();
        }

        return combined;
    }

    /**
     * Splits text into chunks safely below the max token limit.
     * Uses a conservative estimate: 1 token ≈ 0.7 words.
     */
    private List<String> splitByTokensSafe(String text, int maxTokens) {
        String[] words = text.split("\\s+");
        int maxWords = (int) (maxTokens * 0.7); // safer approximation
        List<String> chunks = new ArrayList<>();
        StringBuilder current = new StringBuilder();

        for (String w : words) {
            if (current.length() + w.length() + 1 > maxWords) {
                chunks.add(current.toString().trim());
                current = new StringBuilder();
            }
            current.append(w).append(" ");
        }
        if (current.length() > 0) chunks.add(current.toString().trim());
        return chunks;
    }

    private String callModel(String text) throws IOException {
        if (text == null || text.isBlank()) return "";

        String payload = "{\"inputs\": " + mapper.writeValueAsString(text) + "}";
        System.out.println("Sending payload (length: " + payload.length() + ")");

        String json;
        try {
            json = http.postJson(MODEL_URL, payload);
        } catch (Exception e) {
            System.err.println("HTTP call failed: " + e.getMessage());
            throw e;
        }

        return parseSummary(json);
    }

    private String parseSummary(String json) {
        try {
            JsonNode arr = mapper.readTree(json);
            if (arr.isArray() && arr.size() > 0 && arr.get(0).has("summary_text")) {
                return arr.get(0).get("summary_text").asText();
            } else {
                System.err.println("Unexpected model response: " + json);
                return json;
            }
        } catch (Exception e) {
            System.err.println("Failed to parse JSON: " + e.getMessage() + ", raw response: " + json);
            return json;
        }
    }
}

