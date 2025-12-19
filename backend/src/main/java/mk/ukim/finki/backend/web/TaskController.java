package mk.ukim.finki.backend.web;


import lombok.RequiredArgsConstructor;
import mk.ukim.finki.backend.model.Subtask;
import mk.ukim.finki.backend.model.Tag;
import mk.ukim.finki.backend.model.Task;
import mk.ukim.finki.backend.model.User;
import mk.ukim.finki.backend.model.dto.TaskCreateRequest;
import mk.ukim.finki.backend.model.dto.TaskUpdateRequest;
import mk.ukim.finki.backend.model.enumerations.RecurrenceType;
import mk.ukim.finki.backend.service.TagService;
import mk.ukim.finki.backend.service.TaskService;
import mk.ukim.finki.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final UserService userService;
    private final TagService tagService;

    /* =========================
       TODO LIST (TODAY)
       ========================= */

    @GetMapping("/today/{userId}")
    public List<Task> getTodayTasks(@PathVariable Long userId) {
        return taskService.getTodayTasksForUser(userId);
    }

    @PostMapping("/{taskId}/complete")
    public ResponseEntity<Void> completeTask(
            @PathVariable Long taskId
    ) {
        taskService.completeTask(taskId, LocalDate.now());
        return ResponseEntity.ok().build();
    }

    /* =========================
       ORGANIZATION PAGE
       ========================= */

    @GetMapping("/organization/{userId}")
    public List<Task> getOrganizationTasks(@PathVariable Long userId) {
        return taskService.getOrganizationTasksForUser(userId);
    }

    /* =========================
       CREATE TASK
       ========================= */

    @PostMapping("/{userId}")
    public Task createTask(@PathVariable Long userId, @RequestBody TaskCreateRequest request) {
        User user = userService.getUserById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());

        task.setStartDate(request.getStartDate());
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

        task = taskService.saveTask(task);

        if (request.getTagIds() != null) {
            for (Long tagId : request.getTagIds()) {
                tagService.addTagToTask(task.getId(), tagId);
            }
        }

        return task;
    }

    /* =========================
       UPDATE / DELETE
       ========================= */

    @PutMapping("/{id}")
    public Task updateTask(
            @PathVariable Long id,
            @RequestBody TaskUpdateRequest request
    ) {
        return taskService.updateTask(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
    }

    /* =========================
       AI FEATURES (UNCHANGED)
       ========================= */

    @PostMapping("/{id}/estimate")
    public Task estimateTime(@PathVariable Long id) {
        return taskService.estimateTaskTime(id);
    }

    @PostMapping("/{id}/breakdown")
    public Task breakDownTask(@PathVariable Long id) {
        return taskService.breakdownTask(id);
    }
}
