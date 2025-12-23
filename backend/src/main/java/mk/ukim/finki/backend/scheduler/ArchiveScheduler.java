package mk.ukim.finki.backend.scheduler;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import mk.ukim.finki.backend.model.Task;
import mk.ukim.finki.backend.model.TaskCompletion;
import mk.ukim.finki.backend.repository.TaskCompletionRepository;
import mk.ukim.finki.backend.repository.TaskRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ArchiveScheduler {

    private final TaskCompletionRepository completionRepository;
    private final TaskRepository taskRepository;

    @Scheduled(cron = "0 59 23 * * *")
    @Transactional
    public void archiveCompletedTasks() {
        LocalDate today = LocalDate.now();

        List<TaskCompletion> completedToday =
                completionRepository.findAllCompletedForDate(today);

        for (TaskCompletion completion : completedToday) {
            Task task = completion.getTask();

            if (task.isOneTime()) {
                task.setArchived(true);
                taskRepository.save(task);
                // KEEP completion record for history
            } else {
                // REPEATING → reset for tomorrow
                completionRepository.delete(completion);
            }
        }
    }
}
