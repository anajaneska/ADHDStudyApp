package mk.ukim.finki.backend.service;


import mk.ukim.finki.backend.model.Subtask;
import mk.ukim.finki.backend.model.Task;
import mk.ukim.finki.backend.model.dto.TaskUpdateRequest;
import mk.ukim.finki.backend.model.exeptions.TaskDoesNotExistException;
import mk.ukim.finki.backend.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;


public interface TaskService {
    List<Task> getAllTasksForUser(Long userId);
    Task saveTask(Task task);
    Optional<Task> getTaskById(Long id);
    void deleteTask(Long id);
    Task updateTask(Long id, TaskUpdateRequest request);
    Task toggleTaskCompletion(Long id);
    Subtask estimateSubtaskTime(Long subtaskId);
    Task breakdownTask(Long taskId);
    Subtask breakDownSubtask(Long subtaskId);
    Task estimateTaskTime(Long taskId);
}
