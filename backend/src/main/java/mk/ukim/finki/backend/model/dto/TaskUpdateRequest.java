package mk.ukim.finki.backend.model.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class TaskUpdateRequest {
    private String title;
    private String description;
    private LocalDateTime plannedStart;
    private LocalDateTime dueDate;
    private List<Long> tagIds;
}
