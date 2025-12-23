package mk.ukim.finki.backend.model.dto;

import lombok.Getter;
import lombok.Setter;
import mk.ukim.finki.backend.model.Task;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
public class TaskDTO {

    private Long id;
    private String title;
    private String description;
    private LocalDate startDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private LocalDate dueDate;
    private String recurrenceType;
    private int recurrenceInterval;
    private LocalDate recurrenceEnd;
    private boolean archived;
    private boolean completedToday;
    private List<TagDTO> tags;
    private List<SubtaskDTO> subtasks;

    public static TaskDTO from(Task task) {
        TaskDTO dto = new TaskDTO();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setStartDate(task.getStartDate());
        dto.setStartTime(task.getStartTime());
        dto.setEndTime(task.getEndTime());
        dto.setDueDate(task.getDueDate());
        dto.setRecurrenceType(task.getRecurrenceType() != null ? task.getRecurrenceType().name() : "NONE");
        dto.setRecurrenceInterval(task.getRecurrenceInterval());
        dto.setRecurrenceEnd(task.getRecurrenceEnd());
        dto.setArchived(task.isArchived());
        dto.setCompletedToday(
                task.getCompletions().stream()
                        .anyMatch(c -> c.getDate().equals(LocalDate.now()) && c.isCompleted())
        );
        dto.setTags(task.getTags().stream().map(TagDTO::from).toList());
        dto.setSubtasks(task.getSubtasks().stream().map(SubtaskDTO::from).toList());
        return dto;
    }
}




