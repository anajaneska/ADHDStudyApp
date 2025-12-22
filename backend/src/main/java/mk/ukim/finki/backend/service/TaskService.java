package mk.ukim.finki.backend.service;


import mk.ukim.finki.backend.model.Subtask;
import mk.ukim.finki.backend.model.Task;
import mk.ukim.finki.backend.model.dto.TaskCreateRequest;
import mk.ukim.finki.backend.model.dto.TaskUpdateRequest;
import mk.ukim.finki.backend.model.exeptions.TaskDoesNotExistException;
import mk.ukim.finki.backend.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;


public interface TaskService {
    List<Task> getAllTasksForUser(Long userId);
    Task saveTask(Task task);
    void deleteTask(Long id);
    Task updateTask(Long id, TaskUpdateRequest request);
    Task breakdownTask(Long taskId);
    Task estimateTaskTime(Long taskId);
    List<Task> getTodayTasksForUser(Long userId);
    List<Task> getOrganizationTasksForUser(Long userId);
    Task createTask(Long userId, TaskCreateRequest request);

}
