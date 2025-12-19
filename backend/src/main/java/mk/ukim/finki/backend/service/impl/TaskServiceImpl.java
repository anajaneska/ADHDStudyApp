package mk.ukim.finki.backend.service.impl;

import mk.ukim.finki.backend.model.Subtask;
import mk.ukim.finki.backend.model.Tag;
import mk.ukim.finki.backend.model.Task;
import mk.ukim.finki.backend.model.TaskCompletion;
import mk.ukim.finki.backend.model.dto.TaskUpdateRequest;
import mk.ukim.finki.backend.model.enumerations.RecurrenceType;
import mk.ukim.finki.backend.model.exeptions.TaskDoesNotExistException;
import mk.ukim.finki.backend.repository.SubtaskRepository;
import mk.ukim.finki.backend.repository.TagRepository;
import mk.ukim.finki.backend.repository.TaskCompletionRepository;
import mk.ukim.finki.backend.repository.TaskRepository;
import mk.ukim.finki.backend.service.TaskService;
import mk.ukim.finki.backend.service.impl.AiServiceImpl.AiBreakdownServiceHF;
import mk.ukim.finki.backend.service.impl.AiServiceImpl.AiEstimationServiceHF;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final SubtaskRepository subtaskRepository;
    private final AiEstimationServiceHF aiEstimationService;
    private final AiBreakdownServiceHF aiBreakdownService;
    private final TagRepository tagRepository;
    private final TaskCompletionRepository taskCompletionRepository;

    public TaskServiceImpl(TaskRepository taskRepository, SubtaskRepository subtaskRepository,
                           AiEstimationServiceHF aiEstimationService, AiBreakdownServiceHF aiBreakdownService,
                           TagRepository tagRepository, TaskCompletionRepository taskCompletionRepository) {
        this.taskRepository = taskRepository;
        this.subtaskRepository = subtaskRepository;
        this.aiEstimationService = aiEstimationService;
        this.aiBreakdownService = aiBreakdownService;
        this.tagRepository = tagRepository;
        this.taskCompletionRepository = taskCompletionRepository;
    }

    @Override
    public List<Task> getAllTasksForUser(Long userId) {
        return taskRepository.findByUserId(userId);
    }

    @Override
    public List<Task> getTodayTasksForUser(Long userId) {
        LocalDate today = LocalDate.now();

        return taskRepository.findByUserIdAndArchivedFalse(userId)
                .stream()
                .filter(task -> occursOnSafe(task, today))
                .filter(task -> !taskCompletionRepository
                        .existsByTaskIdAndDate(task.getId(), today))
                .toList();
    }

    // Safe occursOn method
    private boolean occursOnSafe(Task task, LocalDate date) {
        if (task.getStartDate() == null) {
            return false; // or handle as you need
        }

        // Example: check if the task starts on or before the date
        return !task.getStartDate().isAfter(date);
    }
    @Override
    public List<Task> getOrganizationTasksForUser(Long userId) {
        LocalDate today = LocalDate.now();

        return taskRepository.findByUserIdAndArchivedFalse(userId)
                .stream()
                .filter(task ->
                        task.getRecurrenceType() != RecurrenceType.NONE ||
                                task.getStartDate().isAfter(today)
                )
                .toList();
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
                .orElseThrow(() -> new TaskDoesNotExistException(id));

        // -------- BASIC FIELDS --------

        if (request.getTitle() != null) {
            task.setTitle(request.getTitle());
        }

        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }

        // -------- DATE / TIME --------
        // Updated to match new model

        if (request.getStartDate() != null) {
            task.setStartDate(request.getStartDate());
        }

        if (request.getDueDate() != null) {
            task.setDueDate(request.getDueDate());
        }

        if (request.getStartTime() != null) {
            task.setStartTime(request.getStartTime());
        }

        if (request.getEndTime() != null) {
            task.setEndTime(request.getEndTime());
        }

        // -------- RECURRENCE --------

        if (request.getRecurrenceType() != null) {
            task.setRecurrenceType(request.getRecurrenceType());

            // Safety default
            if (task.getRecurrenceType() != RecurrenceType.NONE &&
                    task.getRecurrenceInterval() == null) {
                task.setRecurrenceInterval(1);
            }
        }

        if (request.getRecurrenceInterval() != null) {
            task.setRecurrenceInterval(request.getRecurrenceInterval());
        }

        if (request.getRecurrenceEnd() != null) {
            task.setRecurrenceEnd(request.getRecurrenceEnd());
        }

        // -------- TAGS --------

        if (request.getTagIds() != null) {
            List<Tag> tags = tagRepository.findAllById(request.getTagIds());
            task.setTags(tags);
        }

        return taskRepository.save(task);
    }



    @Override
    public void completeTask(Long taskId, LocalDate date) {

        if (taskCompletionRepository.existsByTaskIdAndDate(taskId, date)) {
            return;
        }

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskDoesNotExistException(taskId));

        TaskCompletion completion = new TaskCompletion();
        completion.setTask(task);
        completion.setDate(date);
        completion.setCompletedAt(LocalDateTime.now());

        taskCompletionRepository.save(completion);
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

    private boolean occursOn(Task task, LocalDate date) {

        if (task.getStartDate().isAfter(date)) return false;

        if (task.getRecurrenceEnd() != null &&
                date.isAfter(task.getRecurrenceEnd())) return false;

        return switch (task.getRecurrenceType()) {
            case NONE -> task.getStartDate().equals(date);
            case DAILY -> true;
            case WEEKLY ->
                    ChronoUnit.WEEKS.between(task.getStartDate(), date)
                            % task.getRecurrenceInterval() == 0;
            case MONTHLY ->
                    ChronoUnit.MONTHS.between(task.getStartDate(), date)
                            % task.getRecurrenceInterval() == 0;
        };
    }
}
