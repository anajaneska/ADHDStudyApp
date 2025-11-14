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
     * Generate subtasks for a task or subtask using Hugging Face model.
     */
    public List<Subtask> generateSubtasks(String title, String description) {
        String prompt = """
            Break down the following task into 3-5 smaller subtasks in JSON format.
            Each subtask should have a 'title' field. Return ONLY a valid JSON array.

            Task Title: %s
            Description: %s
        """.formatted(title, description == null ? "" : description);

        List<Subtask> subtasks = new ArrayList<>();
        try {
            String jsonResponse = chatModelServiceHF.generateFlashcards(prompt); // reuse for text output
            ObjectMapper mapper = new ObjectMapper();
            List<Map<String, String>> data = mapper.readValue(jsonResponse, new TypeReference<>() {});

            for (Map<String, String> item : data) {
                Subtask st = new Subtask();
                st.setTitle(item.get("title"));
                subtasks.add(st);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return subtasks;
    }
}
