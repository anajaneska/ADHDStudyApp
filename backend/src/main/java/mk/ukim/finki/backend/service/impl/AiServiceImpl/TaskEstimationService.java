package mk.ukim.finki.backend.service.impl.AiServiceImpl;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.backend.model.Task;
import mk.ukim.finki.backend.model.exeptions.TaskDoesNotExistException;
import mk.ukim.finki.backend.repository.SubtaskRepository;
import mk.ukim.finki.backend.repository.TaskRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class TaskEstimationService {

    private final TaskRepository taskRepository;
    private final SubtaskRepository subtaskRepository;
    private final GeminiAIService geminiAIService;
    private final Logger log = LoggerFactory.getLogger(TaskEstimationService.class);

    public Task estimateTaskTime(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskDoesNotExistException(taskId));

        if (!task.getSubtasks().isEmpty()) {
            int sum = task.getSubtasks().stream()
                    .mapToInt(st -> {
                        if (st.getEstimatedMinutes() != null) return st.getEstimatedMinutes();

                        int est = estimateMinutesSafe(st.getTitle(), st.getDescription());
                        st.setEstimatedMinutes(est);
                        subtaskRepository.save(st);
                        return est;
                    })
                    .sum();
            task.setEstimatedMinutes(sum);

        } else {
            task.setEstimatedMinutes(estimateMinutesSafe(task.getTitle(), task.getDescription()));
        }

        return taskRepository.save(task);
    }

    private int estimateMinutesSafe(String title, String description) {
        try {
            String raw = geminiAIService.estimateTaskDuration(title, description);
            log.debug("Gemini raw estimation: {}", raw);

            Integer n = extractFirstInteger(raw);
            if (n != null) return clamp(n, 5, 480);

            Integer floatN = extractFloatLikeAsInt(raw);
            if (floatN != null) return clamp(floatN, 5, 480);

            int heuristic = heuristicEstimate(title, description);
            log.warn("Gemini returned no number. Heuristic used: {}. Raw: {}", heuristic, raw);
            return clamp(heuristic, 5, 480);

        } catch (Exception e) {
            log.error("Gemini estimation failed, using heuristic fallback", e);
            return clamp(heuristicEstimate(title, description), 5, 480);
        }
    }

    private Integer extractFirstInteger(String s) {
        if (s == null) return null;
        Matcher m = Pattern.compile("\\b(\\d{1,4})\\b").matcher(s);
        return m.find() ? Integer.parseInt(m.group(1)) : null;
    }

    private Integer extractFloatLikeAsInt(String s) {
        if (s == null) return null;

        Matcher mHour = Pattern.compile("\\b(\\d+(?:\\.\\d+)?)\\s*(hours|hour|h)\\b", Pattern.CASE_INSENSITIVE).matcher(s);
        if (mHour.find()) return (int)Math.round(Double.parseDouble(mHour.group(1)) * 60);

        Matcher m = Pattern.compile("\\b(\\d+(?:\\.\\d+)?)\\b").matcher(s);
        if (m.find()) return (int)Math.round(Double.parseDouble(m.group(1)));

        return null;
    }

    private int heuristicEstimate(String title, String desc) {
        int base = 10;
        int len = (title + " " + desc).length();
        base += Math.min(120, len / 10);
        if (desc != null && desc.toLowerCase().contains("research")) base += 30;
        return base;
    }

    private int clamp(int v, int min, int max) {
        return Math.max(min, Math.min(max, v));
    }
}
