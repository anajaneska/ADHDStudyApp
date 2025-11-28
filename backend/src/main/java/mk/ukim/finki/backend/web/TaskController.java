package mk.ukim.finki.backend.web;


import lombok.RequiredArgsConstructor;
import mk.ukim.finki.backend.model.Subtask;
import mk.ukim.finki.backend.model.Tag;
import mk.ukim.finki.backend.model.Task;
import mk.ukim.finki.backend.model.User;
import mk.ukim.finki.backend.model.dto.TaskCreateRequest;
import mk.ukim.finki.backend.model.dto.TaskUpdateRequest;
import mk.ukim.finki.backend.service.TagService;
import mk.ukim.finki.backend.service.TaskService;
import mk.ukim.finki.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final UserService userService;
    private final TagService tagService;

    @GetMapping("/{userId}")
    public List<Task> getTasks(@PathVariable Long userId) {
        return taskService.getAllTasksForUser(userId);
    }

    @PostMapping("/{userId}")
    public Task createTask(@PathVariable Long userId, @RequestBody TaskCreateRequest request) {
        User user = userService.getUserById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPlannedStart(request.getPlannedStart());
        task.setDueDate(request.getDueDate());
        task.setUser(user);

        task = taskService.saveTask(task);

        // Assign tags if provided
        if (request.getTagIds() != null) {
            for (Long tagId : request.getTagIds()) {
                tagService.addTagToTask(task.getId(), tagId);
            }
        }
        return task;
    }

    @PostMapping("/{taskId}/tags/{tagId}")
    public Task addTagToTask(@PathVariable Long taskId, @PathVariable Long tagId) {
        return tagService.addTagToTask(taskId, tagId);
    }

    @DeleteMapping("/{taskId}/tags/{tagId}")
    public Task removeTagFromTask(@PathVariable Long taskId, @PathVariable Long tagId) {
        return tagService.removeTagFromTask(taskId, tagId);
    }

    @GetMapping("/{taskId}/tags")
    public List<Tag> getTaskTags(@PathVariable Long taskId) {
        Task task = taskService.getTaskById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        return task.getTags();
    }


    @PutMapping("/{id}")
    public Task updateTask(@PathVariable Long id, @RequestBody TaskUpdateRequest request) {
        return taskService.updateTask(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
    }
    @PutMapping("/{id}/complete")
    public Task completeTask(@PathVariable Long id) {
        return taskService.toggleTaskCompletion(id);
    }

    @PostMapping("/{id}/estimate")
    public Task estimateTime(@PathVariable Long id) {
        return taskService.estimateTaskTime(id);
    }

    @PostMapping("/{id}/breakdown")
    public Task breakDownTask(@PathVariable Long id) {
        return taskService.breakdownTask(id);
    }

    @PostMapping("/subtasks/{id}/breakdown")
    public Subtask breakDownSubtask(@PathVariable Long id) {
        return taskService.breakDownSubtask(id);
    }
    @PostMapping("/subtasks/{id}/estimate")
    public Subtask estimateSubtask(@PathVariable Long id) {
        return taskService.estimateSubtaskTime(id);
    }
}
