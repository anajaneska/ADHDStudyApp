package mk.ukim.finki.backend.web;


import lombok.RequiredArgsConstructor;
import mk.ukim.finki.backend.model.Subtask;
import mk.ukim.finki.backend.model.Tag;
import mk.ukim.finki.backend.model.Task;
import mk.ukim.finki.backend.model.User;
import mk.ukim.finki.backend.model.dto.TaskCreateRequest;
import mk.ukim.finki.backend.model.dto.TaskDTO;
import mk.ukim.finki.backend.model.dto.TaskUpdateRequest;
import mk.ukim.finki.backend.model.enumerations.RecurrenceType;
import mk.ukim.finki.backend.model.exeptions.UserDoesNotExistException;
import mk.ukim.finki.backend.service.TagService;
import mk.ukim.finki.backend.service.TaskService;
import mk.ukim.finki.backend.service.UserService;
import mk.ukim.finki.backend.service.impl.TaskCompletionService;
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
    private final TaskCompletionService taskCompletionService;

    @GetMapping("/all/{userId}")
    public List<Task> getAllTasks(@PathVariable Long userId){
        return taskService.getAllTasksForUser(userId);
    }


    @GetMapping("/today/{userId}")
    public List<TaskDTO> getTodayTasks(@PathVariable Long userId) {
        return taskService.getTodayTasksForUser(userId)
                .stream()
                .map(TaskDTO::from)
                .toList();
    }


    @GetMapping("/organization/{userId}")
    public List<Task> getOrganizationTasks(@PathVariable Long userId) {
        return taskService.getOrganizationTasksForUser(userId);
    }

    @PostMapping("/{userId}")
    public Task createTask(@PathVariable Long userId, @RequestBody TaskCreateRequest request) {
        return taskService.createTask(userId,request);
    }

    @PutMapping("/{id}")
    public Task updateTask(@PathVariable Long id, @RequestBody TaskUpdateRequest request) {
        return taskService.updateTask(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
    }

    @PostMapping("/{id}/estimate")
    public Task estimateTime(@PathVariable Long id) {
        return taskService.estimateTaskTime(id);
    }

    @PostMapping("/{id}/breakdown")
    public Task breakDownTask(@PathVariable Long id) {
        return taskService.breakdownTask(id);
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<TaskDTO> completeTask(@PathVariable Long id) {
        Task task = taskCompletionService.toggleCompletion(id);
        return ResponseEntity.ok(TaskDTO.from(task));
    }
}
