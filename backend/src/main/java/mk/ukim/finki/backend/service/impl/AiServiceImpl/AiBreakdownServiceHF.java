package mk.ukim.finki.backend.service.impl.AiServiceImpl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import mk.ukim.finki.backend.model.Subtask;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiBreakdownServiceHF {

    private final ChatModelServiceHF chatModelServiceHF;
    private final ObjectMapper mapper = new ObjectMapper();

    /**
     * Generates a list of subtasks for a given task using AI.
     */
    public List<Subtask> generateSubtasks(String title, String description) {
        try {

            // More strict prompt to force real JSON
            String prompt = """
                    Break down the following task into smaller subtasks.
                    Return ONLY a JSON array. No explanations, no markdown.
                    
                    Each element:
                    {
                      "title": "string",
                      "description": "string"
                    }
                    
                    Task: "%s"
                    Details: "%s"
                    """.formatted(
                    title,
                    description != null ? description : ""
            );

            String aiResponse = chatModelServiceHF.callChat(prompt);

            // Clean up possible markdown wrapper
            aiResponse = aiResponse.trim()
                    .replace("```json", "")
                    .replace("```", "")
                    .trim();

            // Parse JSON
            List<Map<String, String>> items = mapper.readValue(
                    aiResponse,
                    new TypeReference<>() {}
            );

            List<Subtask> subtasks = new ArrayList<>();

            for (Map<String, String> item : items) {
                Subtask st = new Subtask();
                st.setTitle(item.getOrDefault("title", "Untitled"));
                st.setDescription(item.getOrDefault("description", ""));
                st.setCompleted(false);


                subtasks.add(st);
            }

            return subtasks;

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate subtasks via AI. Raw response: \n" + e.getMessage());
        }
    }
}
