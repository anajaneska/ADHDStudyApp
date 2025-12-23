package mk.ukim.finki.backend.model.dto;

import lombok.Getter;
import lombok.Setter;
import mk.ukim.finki.backend.model.Subtask;

@Getter
@Setter
public class SubtaskDTO {
    private Long id;
    private String title;
    private String description;
    private boolean completed;

    public static SubtaskDTO from(Subtask subtask) {
        SubtaskDTO dto = new SubtaskDTO();
        dto.setId(subtask.getId());
        dto.setTitle(subtask.getTitle());
        dto.setDescription(subtask.getDescription());
        dto.setCompleted(subtask.isCompleted());
        return dto;
    }
}
