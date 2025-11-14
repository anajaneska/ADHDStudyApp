package mk.ukim.finki.backend.service.impl.AiServiceImpl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AiEstimationServiceHF {

    private final ChatModelServiceHF chatModelServiceHF;

    /**
     * Estimate time in minutes for a task or subtask using Hugging Face model.
     */
    public int estimateMinutes(String title, String description) {
        String prompt = """
            Estimate realistic time in MINUTES (only return a number) 
            for completing this task:

            Title: %s
            Description: %s
        """.formatted(title, description == null ? "" : description);

        try {
            String response = chatModelServiceHF.generateFlashcards(prompt); // can reuse for simple text generation
            return Integer.parseInt(response.trim());
        } catch (Exception e) {
            return 30; // fallback if AI fails
        }
    }
}

