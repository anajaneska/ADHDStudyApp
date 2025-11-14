package mk.ukim.finki.backend.service.impl.AiServiceImpl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.Map;

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
        String prompt =
                "Generate 5 educational flashcards as JSON with fields: question, answer.\nText: " + text;

        String content = callChat(prompt);

        // Parse the content to ensure it's valid JSON
        ObjectMapper mapper = new ObjectMapper();
        try {
            // This will throw if content is not valid JSON array
            JsonNode node = mapper.readTree(content);

            // If node is an array, return as JSON string
            if (node.isArray()) {
                return mapper.writeValueAsString(node);
            } else {
                throw new IOException("Flashcards output is not a JSON array");
            }
        } catch (Exception e) {
            // If parsing fails, return an empty array instead of invalid JSON
            return "[]";
        }
    }


    public String generateQuiz(String text) throws IOException {
        String prompt =
                "Create a quiz with 5 multiple choice questions (A-D). " +
                        "Return JSON array with fields question, options, correctAnswer.\nText: " + text;

        return callChat(prompt);
    }

    private String callChat(String prompt) throws IOException {

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

        if (content.contains("```")) {
            content = content.replace("```json", "")
                    .replace("```", "")
                    .trim();
        }
        if (content.contains("[")) {
            content = content.substring(content.indexOf("["));
        }

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

}
