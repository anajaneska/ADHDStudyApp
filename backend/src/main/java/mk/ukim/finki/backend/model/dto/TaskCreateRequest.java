package mk.ukim.finki.backend.model.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class TaskCreateRequest {
    private String title;
    private String description;
    private LocalDateTime start;
    private LocalDateTime end;
    private LocalDateTime dueDate;
    private List<Long> tagIds; // <-- IDs of tags to attach
}