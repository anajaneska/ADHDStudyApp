package mk.ukim.finki.backend.service.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import mk.ukim.finki.backend.model.Task;
import mk.ukim.finki.backend.model.TaskCompletion;
import mk.ukim.finki.backend.model.dto.TaskDTO;
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
    public Task toggleCompletion(Long taskId) {
        Task task = taskRepository.findById(taskId).orElseThrow();
        LocalDate today = LocalDate.now();

        TaskCompletion completion = completionRepository
                .findByTaskAndDate(task, today)
                .orElseGet(() -> {
                    TaskCompletion tc = new TaskCompletion();
                    tc.setTask(task);
                    tc.setDate(today);
                    tc.setCompleted(false);
                    return tc;
                });

        // TOGGLE
        completion.setCompleted(!completion.isCompleted());
        completion.setCompletedAt(
                completion.isCompleted() ? LocalDateTime.now() : null
        );

        completionRepository.save(completion);
        return task;
    }
}

