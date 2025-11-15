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

    /**
     * Generates a list of subtasks for a given task.
     */
    public List<Subtask> generateSubtasks(String title, String description) {
        try {
            String prompt = "Break down the following task into smaller subtasks. " +
                    "Return a JSON array with objects having 'title' and 'description'.\n" +
                    "Task: " + title + "\nDetails: " + (description != null ? description : "");

            String aiResponse = chatModelServiceHF.callChat(prompt);

            ObjectMapper mapper = new ObjectMapper();
            List<Map<String, String>> items = mapper.readValue(aiResponse,
                    new TypeReference<List<Map<String, String>>>() {});

            List<Subtask> subtasks = new ArrayList<>();
            for (Map<String, String> item : items) {
                Subtask st = new Subtask();
                st.setTitle(item.get("title"));
                st.setCompleted(false);
                st.setDescription(item.get("description")); // optional, you may need to add a field
                subtasks.add(st);
            }
            return subtasks;

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate subtasks via AI", e);
        }
    }
}
