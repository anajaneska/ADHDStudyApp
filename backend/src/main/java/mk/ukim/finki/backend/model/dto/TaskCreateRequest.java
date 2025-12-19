package mk.ukim.finki.backend.model.dto;

import lombok.Data;
import mk.ukim.finki.backend.model.enumerations.RecurrenceType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
public class TaskCreateRequest {

    private String title;
    private String description;

    // Scheduling
    private LocalDate startDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private LocalDate dueDate;

    // Recurrence
    private RecurrenceType recurrenceType;   // NONE, DAILY, WEEKLY, MONTHLY
    private Integer recurrenceInterval;       // e.g. every 2 weeks
    private LocalDate recurrenceEnd;           // optional

    private Integer estimatedMinutes;
    private List<Long> tagIds;
}
