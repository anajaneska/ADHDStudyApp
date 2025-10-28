package mk.ukim.finki.backend.service.impl;

import mk.ukim.finki.backend.model.Task;
import mk.ukim.finki.backend.model.exeptions.TaskDoesNotExistException;
import mk.ukim.finki.backend.repository.TaskRepository;
import mk.ukim.finki.backend.service.TaskService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TaskServiceImpl implements TaskService {
    private final TaskRepository taskRepository;

    public TaskServiceImpl(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }
    @Override
    public List<Task> getAllTasksForUser(Long userId) {
        return taskRepository.findByUserId(userId);
    }
    @Override
    public Task saveTask(Task task) {
        return taskRepository.save(task);
    }
    @Override
    public Optional<Task> getTaskById(Long id) {
        return taskRepository.findById(id);
    }
    @Override
    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    @Override
    public Task updateTask(Long id, Task updatedTask) throws TaskDoesNotExistException {
        return taskRepository.findById(id)
                .map(task -> {
                    task.setTitle(updatedTask.getTitle());
                    task.setDescription(updatedTask.getDescription());
                    task.setDueDate(updatedTask.getDueDate());
                    task.setPlannedStart(updatedTask.getPlannedStart());
                    task.setCompleted(updatedTask.isCompleted());
                    return taskRepository.save(task);
                })
                .orElseThrow(() -> new TaskDoesNotExistException(updatedTask.getId()));
    }

    @Override
    public Task toggleTaskCompletion(Long id) {
        return taskRepository.findById(id)
                .map(task -> {
                    task.setCompleted(!task.isCompleted());
                    return taskRepository.save(task);
                })
                .orElseThrow(() -> new TaskDoesNotExistException(id));
    }
}
