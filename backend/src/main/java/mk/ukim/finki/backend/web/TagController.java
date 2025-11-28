package mk.ukim.finki.backend.web;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.backend.model.Tag;
import mk.ukim.finki.backend.model.dto.TagDTO;
import mk.ukim.finki.backend.service.TagService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    @PostMapping("/{userId}/create")
    public ResponseEntity<Tag> createTag(
            @PathVariable Long userId,
            @RequestBody TagDTO dto
    ) {
        Tag tag = tagService.createTag(userId, dto.getName(), dto.getColor());
        return ResponseEntity.ok(tag);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<Tag>> getUserTags(@PathVariable Long userId) {
        return ResponseEntity.ok(tagService.getTags(userId));
    }

    @DeleteMapping("/{tagId}")
    public ResponseEntity<Void> delete(@PathVariable Long tagId) {
        tagService.deleteTag(tagId);
        return ResponseEntity.noContent().build();
    }
}

