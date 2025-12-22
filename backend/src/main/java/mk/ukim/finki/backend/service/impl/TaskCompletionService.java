package mk.ukim.finki.backend.service.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import mk.ukim.finki.backend.model.Task;
import mk.ukim.finki.backend.model.TaskCompletion;
import mk.ukim.finki.backend.repository.TaskCompletionRepository;
import mk.ukim.finki.backend.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class TaskCompletionService {

    private final TaskRepository taskRepository;
    private final TaskCompletionRepository completionRepository;

    @Transactional
    public Task completeTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow();

        LocalDate today = LocalDate.now();

        // ONE-TIME TASK → completed forever
        if (task.isOneTime()) {
            if (task.isArchived()) {
                return task;
            }

            task.setArchived(true);
            task.setNextReminderAt(null);
            return taskRepository.save(task);
        }

        // REPEATING TASK → completed ONLY for today
        if (!completionRepository.existsByTaskAndDate(task, today)) {
            TaskCompletion completion = new TaskCompletion();
            completion.setTask(task);
            completion.setDate(today);
            completion.setCompletedAt(LocalDateTime.now());
            completionRepository.save(completion);
        }

        task.setNextReminderAt(null);
        return task;
    }
}

