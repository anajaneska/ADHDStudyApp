package mk.ukim.finki.backend.service.impl;

import mk.ukim.finki.backend.model.Subtask;
import mk.ukim.finki.backend.model.Tag;
import mk.ukim.finki.backend.model.Task;
import mk.ukim.finki.backend.model.dto.TaskUpdateRequest;
import mk.ukim.finki.backend.model.exeptions.TaskDoesNotExistException;
import mk.ukim.finki.backend.repository.SubtaskRepository;
import mk.ukim.finki.backend.repository.TagRepository;
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
    private final TagRepository tagRepository;

    public TaskServiceImpl(TaskRepository taskRepository, SubtaskRepository subtaskRepository,
                           AiEstimationServiceHF aiEstimationService, AiBreakdownServiceHF aiBreakdownService,
                           TagRepository tagRepository) {
        this.taskRepository = taskRepository;
        this.subtaskRepository = subtaskRepository;
        this.aiEstimationService = aiEstimationService;
        this.aiBreakdownService = aiBreakdownService;
        this.tagRepository = tagRepository;
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
    public Task updateTask(Long id, TaskUpdateRequest request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStart(request.getStart());
        task.setEnd(request.getEnd());
        task.setDueDate(request.getDueDate());

        if (request.getTagIds() != null) {
            List<Tag> tags = tagRepository.findAllById(request.getTagIds());
            task.setTags(tags);
        }

        return taskRepository.save(task);
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

    // ------------------------------------------------------------
    //   TIME ESTIMATION (NO RECURSIVE NESTING ANYMORE)
    // ------------------------------------------------------------

    public Task estimateTaskTime(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (!task.getSubtasks().isEmpty()) {
            int sum = task.getSubtasks()
                    .stream()
                    .mapToInt(st -> {
                        if (st.getEstimatedMinutes() != null)
                            return st.getEstimatedMinutes();

                        int est = aiEstimationService.estimateMinutes(st.getTitle(), st.getDescription());
                        st.setEstimatedMinutes(est);
                        subtaskRepository.save(st);
                        return est;
                    })
                    .sum();

            task.setEstimatedMinutes(sum);
        } else {
            int estimate = aiEstimationService.estimateMinutes(task.getTitle(), task.getDescription());
            task.setEstimatedMinutes(estimate);
        }

        return taskRepository.save(task);
    }


    // ------------------------------------------------------------
    //     BREAKDOWN — ONLY TASKS CAN BE BROKEN DOWN NOW
    // ------------------------------------------------------------

    public Task breakdownTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        List<Subtask> subtasks = aiBreakdownService.generateSubtasks(task.getTitle(), task.getDescription());

        for (Subtask st : subtasks) {
            st.setTask(task);
        }

        task.getSubtasks().addAll(subtasks);
        return taskRepository.save(task);
    }
}
