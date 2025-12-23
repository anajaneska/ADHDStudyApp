package mk.ukim.finki.backend.model.dto;

import lombok.Getter;
import lombok.Setter;
import mk.ukim.finki.backend.model.Tag;

@Getter
@Setter
public class TagDTO {
    private Long id;
    private String name;
    private String color;

    public static TagDTO from(Tag tag) {
        TagDTO dto = new TagDTO();
        dto.setId(tag.getId());
        dto.setName(tag.getName());
        dto.setColor(tag.getColor());
        return dto;
    }
}
