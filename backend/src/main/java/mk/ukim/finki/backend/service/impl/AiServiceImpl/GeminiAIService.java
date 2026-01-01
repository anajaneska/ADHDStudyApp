package mk.ukim.finki.backend.service.impl.AiServiceImpl;

import com.google.genai.Client;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class GeminiAIService {

    private Client client;

    public GeminiAIService(@Value("${gemini.api.key}") String apiKey) {
        // Set environment variable BEFORE creating Client
        System.setProperty("GOOGLE_API_KEY", apiKey);

        // Now Client reads the key from env
        client = new Client();

    }

    public String summarize(String text) {
        String prompt = """
                Одговори ИСКЛУЧИВО на македонски јазик.
                Користи јасен и разбирлив студентски јазик.
                Направи кратко и структуирано резиме.

                Текст:
                """ + text;

        return client.models.generateContent("gemini-2.5-flash", prompt, null)
                .text()
                .trim();
    }
    public String generateFlashcards(String text) {
        String prompt = """
                Одговори ИСКЛУЧИВО на македонски јазик.
                Направи 10 кратки и јасни flashcards од текстот.
                Секоја flashcard треба да има прашање и одговор.
                Формат: JSON список од објекти со полета 'question' и 'answer'.

                Текст:
                """ + text;

        return client.models.generateContent("gemini-2.5-flash", prompt, null)
                .text()
                .trim();
    }
    public String generateQuiz(String text) {
        String prompt = """
                Одговори ИСКЛУЧИВО на македонски јазик.
                Направи 5 кратки прашања со повеќе опции (multiple choice) од текстот.
                Секоја прашање треба да има полета:
                - "question": текст на прашањето
                - "options": листа со 4 опции
                - "correctAnswer": точен одговор

                Формат: Чиста JSON листа (array) на објекти со горенаведените полиња, без никакви објаснувања или backticks.

                Текст:
                """ + text;

        return client.models.generateContent("gemini-2.5-flash", prompt, null)
                .text()
                .trim();
    }
    public String generateSubtasks(String taskTitle, String taskDescription) {
        String prompt = """
            Одговори ИСКЛУЧИВО на македонски јазик.
            Подели ја следната задача на помали подзадачи (subtasks).
            Врати ЧИСТА JSON листа (array) од објекти, без објаснувања или markdown.
            
            Секој објект треба да има:
            {
              "title": "назив на подзадача",
              "description": "опис на подзадача"
            }
            
            Задача: "%s"
            Детали: "%s"
            """.formatted(
                taskTitle,
                taskDescription != null ? taskDescription : ""
        );

        return client.models.generateContent("gemini-2.5-flash", prompt, null)
                .text()
                .trim();
    }
    public String estimateTaskDuration(String title, String description) {
        String prompt = """
            Одговори ИСКЛУЧИВО на македонски јазик.
            Процени времетраење на следната задача во минути.
            Врати САМО број, без зборови, без ознаки.

            Пример излез:
            45

            Наслов: "%s"
            Опис: "%s"
            """.formatted(
                title != null ? title : "",
                description != null ? description : ""
        );

        return client.models.generateContent("gemini-2.5-flash", prompt, null)
                .text()
                .trim();
    }


}
