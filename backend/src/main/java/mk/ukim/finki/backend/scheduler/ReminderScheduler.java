package mk.ukim.finki.backend.scheduler;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.backend.service.impl.ReminderService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ReminderScheduler {

    private final ReminderService reminderService;

    // Runs every day at 09:00
    @Scheduled(cron = "0 0 9 * * *")
    public void sendTaskReminders() {
        reminderService.processReminders();
    }
}