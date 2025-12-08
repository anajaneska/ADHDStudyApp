package mk.ukim.finki.backend.service.impl.AiServiceImpl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;

@Service
public class ChatModelServiceHF {

    private static final String MODEL_URL = "https://router.huggingface.co/v1/chat/completions";
    private static final String MODEL_NAME = "google/gemma-2-2b-it:nebius";

    private final HttpClientHF http;
    private final ObjectMapper mapper = new ObjectMapper();

    public ChatModelServiceHF(HttpClientHF http) {
        this.http = http;
    }

    public String generateFlashcards(String text) throws IOException {
        if (text == null || text.isBlank()) return "[]";

        String prompt = "Generate 5 educational flashcards as JSON with fields: question, answer. " +
                "Respond ONLY with a JSON array. Input text: " + text;

        String result = callChat(prompt);
        JsonNode node = parseJsonArrayOrEmpty(result);

        List<Map<String, String>> flashcards = new ArrayList<>();
        Set<String> questions = new HashSet<>();

        for (JsonNode n : node) {
            String question = n.path("question").asText("").trim();
            String answer = n.path("answer").asText("").trim();

            if (!question.isEmpty() && !answer.isEmpty() && questions.add(question)) {
                flashcards.add(Map.of("question", question, "answer", answer));
            }

            // Stop after 5 unique flashcards
            if (flashcards.size() >= 5) break;
        }

        return mapper.writeValueAsString(flashcards);
    }
    public String generateSummary(String text) throws IOException {
        if (text == null || text.isBlank()) return "";

        String prompt =
                "Summarize the following text into at most 10 short, clear sentences. "
                        + "Return ONLY a JSON array. Each item should be either an object "
                        + "with a 'sentence' field OR just a string.\n\nText:\n" + text;

        String result = callChat(prompt);

        JsonNode node = parseJsonArrayOrEmpty(result);
        List<String> sentences = new ArrayList<>();
        Set<String> seen = new HashSet<>();

        for (JsonNode n : node) {
            String sentence = "";

            if (n.has("sentence")) {
                sentence = n.get("sentence").asText().trim();
            } else if (n.isTextual()) {
                sentence = n.asText().trim();
            }

            if (!sentence.isEmpty() && seen.add(sentence)) {
                sentences.add(sentence);
            }
            if (sentences.size() >= 10) break;
        }

        // Fallback: if AI ignored JSON, split by punctuation
        if (sentences.isEmpty()) {
            String[] parts = result.split("(?<=[.!?])\\s+");
            for (String p : parts) {
                String s = p.trim();
                if (!s.isEmpty()) {
                    sentences.add(s);
                }
                if (sentences.size() >= 10) break;
            }
        }

        // Join sentences as normal text
        return String.join(" ", sentences);
    }

    private List<Map<String, String>> fallbackSentenceSplit(String raw) {
        List<Map<String, String>> list = new ArrayList<>();

        String[] parts = raw.split("(?<=[.!?])\\s+");

        for (String p : parts) {
            String s = p.trim();
            if (!s.isEmpty()) {
                list.add(Map.of("sentence", s));
            }
            if (list.size() >= 10) break;
        }

        return list;
    }



    public String generateQuiz(String text) throws IOException {
        String prompt =
                "Create a quiz with 5 multiple choice questions (A-D). " +
                        "Return JSON array with fields question, options, correctAnswer.\nText: " + text;

        return callChat(prompt);
    }

    public String callChat(String prompt) throws IOException {
        Map<String, Object> body = Map.of(
                "model", MODEL_NAME,
                "stream", false,
                "messages", List.of(
                        Map.of("role", "user", "content", prompt)
                )
        );

        String payload = mapper.writeValueAsString(body);
        String response = http.postJson(MODEL_URL, payload);

        JsonNode root = mapper.readTree(response);
        String content = root.path("choices").get(0).path("message").path("content").asText();

        // Remove markdown code fences if present
        if (content.contains("```")) {
            content = content.replace("```json", "").replace("```", "").trim();
        }

        // Trim leading text before JSON array
        int idx = content.indexOf("[");
        if (idx != -1) content = content.substring(idx).trim();

        return content;
    }
    public String generateSubtasks(String text) throws IOException {
        String prompt =
                "Break down this task into 5-8 smaller subtasks. " +
                        "Return ONLY a JSON array of strings. No explanation.\n" +
                        "Task: " + text;

        String result = callChat(prompt);

        if (result.contains("[")) {
            result = result.substring(result.indexOf("["));
        }

        if (result.contains("```")) {
            result = result.replace("```json", "").replace("```", "").trim();
        }

        return result;
    }
    public String generateEstimation(String prompt) throws IOException {
        return callChat(prompt); // whatever your wrapper is
    }
    private List<String> splitByWordsSafe(String text, int maxWords) {
        String[] words = text.split("\\s+");
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

    // -----------------------
    // PARSE JSON ARRAY OR EMPTY
    // -----------------------
    private JsonNode parseJsonArrayOrEmpty(String json) {
        try {
            JsonNode node = mapper.readTree(json);
            if (node.isArray()) return node;
        } catch (Exception ignored) { }
        return mapper.createArrayNode();
    }


}
