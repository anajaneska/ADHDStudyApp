package mk.ukim.finki.backend.web;


import mk.ukim.finki.backend.model.Task;
import mk.ukim.finki.backend.model.User;
import mk.ukim.finki.backend.service.TaskService;
import mk.ukim.finki.backend.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:3000")
public class TaskController {

    private final TaskService taskService;
    private final UserService userService;

    public TaskController(TaskService taskService, UserService userService) {
        this.taskService = taskService;
        this.userService = userService;
    }

    @GetMapping("/{userId}")
    public List<Task> getTasks(@PathVariable Long userId) {
        return taskService.getAllTasksForUser(userId);
    }

    @PostMapping("/{userId}")
    public Task createTask(@PathVariable Long userId, @RequestBody Task task) {
        User user = userService.getUserById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        task.setUser(user);
        return taskService.saveTask(task);
    }

    @PutMapping("/{id}")
    public Task updateTask(@PathVariable Long id, @RequestBody Task updatedTask) {
        return taskService.getTaskById(id).map(task -> {
            task.setTitle(updatedTask.getTitle());
            task.setDescription(updatedTask.getDescription());
            task.setDueDate(updatedTask.getDueDate());
            task.setPlannedStart(updatedTask.getPlannedStart());
            task.setCompleted(updatedTask.isCompleted());
            return taskService.saveTask(task);
        }).orElseThrow(() -> new RuntimeException("Task not found"));
    }

    @DeleteMapping("/{userId}/{id}")
    public void deleteTask(@PathVariable Long userId, @PathVariable Long id) {
        taskService.deleteTask(id);
    }
    @PutMapping("/{id}/complete")
    public Task completeTask(@PathVariable Long id) {
        return taskService.getTaskById(id).map(task -> {
            task.setCompleted(true);  // mark task as completed
            return taskService.saveTask(task);
        }).orElseThrow(() -> new RuntimeException("Task not found"));
    }
}
