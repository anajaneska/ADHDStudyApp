package mk.ukim.finki.backend.service.impl;

import mk.ukim.finki.backend.model.Subtask;
import mk.ukim.finki.backend.model.Task;
import mk.ukim.finki.backend.model.exeptions.TaskDoesNotExistException;
import mk.ukim.finki.backend.repository.SubtaskRepository;
import mk.ukim.finki.backend.repository.TaskRepository;
import mk.ukim.finki.backend.service.TaskService;
import mk.ukim.finki.backend.service.impl.AiServiceImpl.AiBreakdownServiceHF;
import mk.ukim.finki.backend.service.impl.AiServiceImpl.AiEstimationServiceHF;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TaskServiceImpl implements TaskService {
    private final TaskRepository taskRepository;
    private final SubtaskRepository subtaskRepository;
    private final AiEstimationServiceHF aiEstimationService;
    private final AiBreakdownServiceHF aiBreakdownService;
    public TaskServiceImpl(TaskRepository taskRepository, SubtaskRepository subtaskRepository, AiEstimationServiceHF aiEstimationService, AiBreakdownServiceHF aiBreakdownService) {
        this.taskRepository = taskRepository;
        this.subtaskRepository = subtaskRepository;
        this.aiEstimationService = aiEstimationService;
        this.aiBreakdownService = aiBreakdownService;
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
    //
    public Task estimateTaskTime(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        int total = estimateTaskRecursive(task);
        task.setEstimatedMinutes(total);

        return taskRepository.save(task);
    }
    public Subtask estimateSubtaskTime(Long subtaskId) {
        Subtask subtask = subtaskRepository.findById(subtaskId)
                .orElseThrow(() -> new RuntimeException("Subtask not found"));
        int time = estimateSubtaskRecursive(subtask);

        subtask.setEstimatedMinutes(time);
        return subtaskRepository.save(subtask);
    }

    private int estimateTaskRecursive(Task task) {
        if (!task.getSubtasks().isEmpty()) {
            int sum = 0;
            for (Subtask st : task.getSubtasks()) {
                sum += estimateSubtaskRecursive(st);
            }
            task.setEstimatedMinutes(sum);
            return sum;
        }

        int estimate = aiEstimationService.estimateMinutes(task.getTitle(), task.getDescription());
        task.setEstimatedMinutes(estimate);
        return estimate;
    }



    private int estimateSubtaskRecursive(Subtask st) {
        if (!st.getChildren().isEmpty()) {
            int sum = 0;
            for (Subtask child : st.getChildren()) {
                sum += estimateSubtaskRecursive(child);
            }
            st.setEstimatedMinutes(sum);
            return sum;
        }

        int estimate = aiEstimationService.estimateMinutes(st.getTitle(), null);
        st.setEstimatedMinutes(estimate);
        return estimate;
    }

    public Task breakdownTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        List<Subtask> subtasks = aiBreakdownService.generateSubtasks(task.getTitle(), task.getDescription());

        // Set relationships
        for (Subtask st : subtasks) {
            st.setTask(task);
            st.setParent(null);
        }

        task.getSubtasks().addAll(subtasks);
        return taskRepository.save(task);
    }

    public Subtask breakDownSubtask(Long subtaskId) {
        Subtask parent = subtaskRepository.findById(subtaskId)
                .orElseThrow(() -> new RuntimeException("Subtask not found"));

        List<Subtask> children = aiBreakdownService.generateSubtasks(parent.getTitle(), null);

        for (Subtask child : children) {
            child.setParent(parent);
            child.setTask(parent.getTask());
        }

        parent.getChildren().addAll(children);
        return subtaskRepository.save(parent);
    }
}
