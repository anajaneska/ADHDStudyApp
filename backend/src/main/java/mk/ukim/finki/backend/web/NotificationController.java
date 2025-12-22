package mk.ukim.finki.backend.web;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.backend.model.Notification;
import mk.ukim.finki.backend.repository.NotificationRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    @GetMapping("/{userId}")
    public List<Notification> getUserNotifications(@PathVariable Long userId) {
        return notificationRepository.findByUserIdAndSeenFalse(userId);
    }

    @PutMapping("/{id}/seen")
    public void markAsSeen(@PathVariable Long id) {
        Notification notification = notificationRepository
                .findById(id)
                .orElseThrow();

        notification.setSeen(true);
        notificationRepository.save(notification);
    }
}


