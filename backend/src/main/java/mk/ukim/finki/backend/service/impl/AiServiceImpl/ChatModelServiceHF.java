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

    public String generateQuiz(String text) throws IOException {
        if (text == null || text.isBlank()) return "[]";

        String prompt =
                "Create a quiz with EXACTLY 5 multiple-choice questions based ONLY on the text.\n" +
                        "Return ONLY a JSON array. Each item MUST be:\n" +
                        "{\n" +
                        "  \"question\": \"...\",\n" +
                        "  \"options\": [\"A: ...\", \"B: ...\", \"C: ...\", \"D: ...\"],\n" +
                        "  \"correctAnswer\": \"A\"\n" +
                        "}\n" +
                        "The options MUST contain full text.\n" +
                        "Text:\n" + text;

        String result = callChat(prompt);

        // --- Clean up the response ---
        if (result.contains("```")) {
            result = result.replaceAll("```json", "")
                    .replaceAll("```", "")
                    .trim();
        }

        int idx = result.indexOf("[");
        if (idx != -1) result = result.substring(idx).trim();

        ObjectMapper mapper = new ObjectMapper();
        JsonNode node;
        try {
            node = mapper.readTree(result);
            if (!node.isArray()) node = mapper.createArrayNode();
        } catch (Exception e) {
            node = mapper.createArrayNode();
        }

        List<Map<String, Object>> quizItems = new ArrayList<>();

        for (JsonNode n : node) {
            String question = n.path("question").asText("").trim();
            if (question.isEmpty()) continue;

            // --- OPTIONS ---
            List<String> gatheredOptions = new ArrayList<>();
            JsonNode optionsNode = n.path("options");

            if (optionsNode.isArray()) {
                for (JsonNode o : optionsNode) {
                    String opt = o.asText("").trim();
                    if (opt.isEmpty()) continue;

                    // Normalize A. → A:
                    opt = opt.replace("A.", "A:").replace("B.", "B:")
                            .replace("C.", "C:").replace("D.", "D:");

                    gatheredOptions.add(opt);
                }
            }

            if (gatheredOptions.size() < 4) continue;

            List<String> options = new ArrayList<>(gatheredOptions.subList(0, 4));

            // --- CORRECT ANSWER ---
            String correct = n.path("correctAnswer").asText("").trim().toUpperCase();

            String fullCorrectOption = options.stream()
                    .filter(o -> o.toUpperCase().startsWith(correct + ":"))
                    .findFirst()
                    .orElse(options.get(0)); // fallback

            quizItems.add(Map.of(
                    "question", question,
                    "options", options,
                    "correctAnswer", fullCorrectOption
            ));

            if (quizItems.size() == 5) break;
        }

        return mapper.writeValueAsString(quizItems);
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

    public String generateEstimation(String prompt) throws IOException {
        return callChat(prompt);
    }

    private JsonNode parseJsonArrayOrEmpty(String json) {
        try {
            JsonNode node = mapper.readTree(json);
            if (node.isArray()) return node;
        } catch (Exception ignored) { }
        return mapper.createArrayNode();
    }


}
