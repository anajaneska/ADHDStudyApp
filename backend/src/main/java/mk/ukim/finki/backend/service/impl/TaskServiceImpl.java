package mk.ukim.finki.backend.service.impl;


import lombok.RequiredArgsConstructor;
import mk.ukim.finki.backend.model.*;
import mk.ukim.finki.backend.model.dto.TaskCreateRequest;
import mk.ukim.finki.backend.model.dto.TaskUpdateRequest;
import mk.ukim.finki.backend.model.enumerations.RecurrenceType;
import mk.ukim.finki.backend.model.exeptions.TaskDoesNotExistException;
import mk.ukim.finki.backend.model.exeptions.UserDoesNotExistException;
import mk.ukim.finki.backend.repository.*;
import mk.ukim.finki.backend.service.TagService;
import mk.ukim.finki.backend.service.TaskService;
import mk.ukim.finki.backend.service.UserService;
import mk.ukim.finki.backend.service.impl.AiServiceImpl.AiBreakdownServiceHF;
import mk.ukim.finki.backend.service.impl.AiServiceImpl.AiEstimationServiceHF;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final SubtaskRepository subtaskRepository;
    private final AiEstimationServiceHF aiEstimationService;
    private final AiBreakdownServiceHF aiBreakdownService;
    private final TagRepository tagRepository;
    private final TaskCompletionRepository taskCompletionRepository;
    private final UserService userService;
    private final TagService tagService;


    @Override
    public List<Task> getAllTasksForUser(Long userId) {
        return taskRepository.findByUserId(userId);
    }

    @Override
    public List<Task> getTodayTasksForUser(Long userId) {
        LocalDate today = LocalDate.now();
        return taskRepository.findByUserIdAndArchivedFalse(userId)
                .stream()
                .filter(task -> occursOn(task, today))
                .toList();
    }


    private boolean occursOn(Task task, LocalDate date) {
        if (task.getStartDate() == null) {
            return false;
        }

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
    public Task createTask(Long userId, TaskCreateRequest request){
        User user = userService.getUserById(userId)
                .orElseThrow(() -> new UserDoesNotExistException(userId));

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());

        task.setStartDate(
                request.getStartDate() != null
                ? request.getStartDate()
                : LocalDate.now()
        );

        task.setStartTime(request.getStartTime());
        task.setEndTime(request.getEndTime());
        task.setDueDate(request.getDueDate());

        task.setRecurrenceType(
                request.getRecurrenceType() != null
                        ? request.getRecurrenceType()
                        : RecurrenceType.NONE
        );

        task.setRecurrenceInterval(
                request.getRecurrenceInterval() != null
                        ? request.getRecurrenceInterval()
                        : 1
        );

        task.setRecurrenceEnd(request.getRecurrenceEnd());
        task.setEstimatedMinutes(request.getEstimatedMinutes());
        task.setUser(user);

        task = saveTask(task);

        if (request.getTagIds() != null) {
            for (Long tagId : request.getTagIds()) {
                tagService.addTagToTask(task.getId(), tagId);
            }
        }

        return task;
    }

    @Override
    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    @Override
    public Task updateTask(Long id, TaskUpdateRequest request) {

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new TaskDoesNotExistException(id));


        if (request.getTitle() != null) {
            task.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }

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

        if (request.getRecurrenceType() != null) {
            task.setRecurrenceType(request.getRecurrenceType());

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


        if (request.getTagIds() != null) {
            List<Tag> tags = tagRepository.findAllById(request.getTagIds());
            task.setTags(tags);
        }

        return taskRepository.save(task);
    }


    public Task estimateTaskTime(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskDoesNotExistException(taskId));

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

    public Task breakdownTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskDoesNotExistException(taskId));

        List<Subtask> subtasks = aiBreakdownService.generateSubtasks(task.getTitle(), task.getDescription());

        for (Subtask st : subtasks) {
            st.setTask(task);
        }

        task.getSubtasks().addAll(subtasks);
        return taskRepository.save(task);
    }

}
