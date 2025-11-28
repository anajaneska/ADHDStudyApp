package mk.ukim.finki.backend.service;

import mk.ukim.finki.backend.model.Tag;
import mk.ukim.finki.backend.model.Task;

import java.util.List;

public interface TagService {
    Tag createTag(Long userId, String name, String color);
    List<Tag> getTags(Long userId);
    void deleteTag(Long tagId);
    Task addTagToTask(Long taskId, Long tagId);
    Task removeTagFromTask(Long taskId, Long tagId);
}
