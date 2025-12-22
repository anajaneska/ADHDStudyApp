package mk.ukim.finki.backend.service.impl;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.backend.model.Tag;
import mk.ukim.finki.backend.model.Task;
import mk.ukim.finki.backend.model.User;
import mk.ukim.finki.backend.model.exeptions.TagDoesNotExistException;
import mk.ukim.finki.backend.model.exeptions.TaskDoesNotExistException;
import mk.ukim.finki.backend.model.exeptions.UserDoesNotExistException;
import mk.ukim.finki.backend.repository.TagRepository;
import mk.ukim.finki.backend.repository.TaskRepository;
import mk.ukim.finki.backend.repository.UserRepository;
import mk.ukim.finki.backend.service.TagService;
import mk.ukim.finki.backend.service.TaskService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TagServiceImpl implements TagService {

    private final TagRepository tagRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Override
    public Tag createTag(Long userId, String name, String color) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserDoesNotExistException(userId));

        Tag tag = new Tag();
        tag.setName(name);
        tag.setColor(color);
        tag.setUser(user);

        return tagRepository.save(tag);
    }

    @Override
    public List<Tag> getTags(Long userId) {
        return tagRepository.findByUserId(userId);
    }

    @Override
    public void deleteTag(Long tagId) {
        tagRepository.deleteById(tagId);
    }

    @Override
    public Task addTagToTask(Long taskId, Long tagId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskDoesNotExistException(taskId));
        Tag tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new TagDoesNotExistException(tagId));

        if (!task.getTags().contains(tag)) {
            task.getTags().add(tag);
        }
        return taskRepository.save(task);
    }

    @Override
    public Task removeTagFromTask(Long taskId, Long tagId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskDoesNotExistException(taskId));
        Tag tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new TagDoesNotExistException(tagId));

        task.getTags().remove(tag);
        return taskRepository.save(task);
    }
}

