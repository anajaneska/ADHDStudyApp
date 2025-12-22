package mk.ukim.finki.backend.service.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import mk.ukim.finki.backend.model.Notification;
import mk.ukim.finki.backend.model.Task;
import mk.ukim.finki.backend.model.enumerations.NotificationType;
import mk.ukim.finki.backend.repository.NotificationRepository;
import mk.ukim.finki.backend.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReminderService {

    private final TaskRepository taskRepository;
    private final NotificationRepository notificationRepository;

    @Transactional
    public void processReminders() {

        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);

        List<Task> tasks = taskRepository.findByArchivedFalse();

        for (Task task : tasks) {
            // Skip repeating tasks already completed today
            if (!task.isOneTime() && task.isCompletedOn(today)) {
                continue;
            }

            // OVERDUE TASK
            if (task.isOverdue(today)) {
                createNotification(
                        task,
                        NotificationType.OVERDUE,
                        "Overdue task: " + task.getTitle()
                );
                continue;
            }

            // UPCOMING DEADLINE
            if (task.isOneTime()
                    && task.getDueDate() != null
                    && (task.getDueDate().isEqual(today)
                    || task.getDueDate().isEqual(tomorrow))) {

                createNotification(
                        task,
                        NotificationType.UPCOMING_DEADLINE,
                        "Upcoming deadline: " + task.getTitle()
                );
                continue;
            }

            // UPCOMING TASK (30 MIN BEFORE START)
            if (task.getStartDate() != null && task.getStartTime() != null) {

                LocalDateTime taskStart = LocalDateTime.of(
                        task.getStartDate(),
                        task.getStartTime()
                );

                LocalDateTime notifyAt = taskStart.minusMinutes(30);

                if (!notifyAt.isAfter(LocalDateTime.now())
                        && task.getLastReminderSentDate() == null) {

                    createNotification(
                            task,
                            NotificationType.UPCOMING_TASK,
                            "Task starts in 30 minutes: " + task.getTitle()
                    );

                    task.setLastReminderSentDate(LocalDate.now());
                    taskRepository.save(task);
                }
            }

        }
    }

    private void createNotification(Task task, NotificationType type, String message) {
        boolean alreadyExists = notificationRepository.existsByUserIdAndTypeAndMessageAndSeenFalse(
                        task.getUser().getId(), type, message);

        if (alreadyExists) return;

        Notification notification = new Notification();
        notification.setUser(task.getUser());
        notification.setType(type);
        notification.setMessage(message);

        notificationRepository.save(notification);
    }
}
