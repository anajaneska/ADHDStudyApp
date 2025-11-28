package mk.ukim.finki.backend.model.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AttachTagRequest {
    private Long taskId;
    private Long tagId;
}

