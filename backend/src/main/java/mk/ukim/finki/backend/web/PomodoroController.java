package mk.ukim.finki.backend.web;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.backend.model.PomodoroSession;
import mk.ukim.finki.backend.model.PomodoroSettings;
import mk.ukim.finki.backend.repository.PomodoroRepository;
import mk.ukim.finki.backend.service.PomodoroService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pomodoro")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class PomodoroController {
    private final PomodoroService pomodoroService;
    @PostMapping("/start")
    public PomodoroSession startSession(@RequestBody PomodoroSession session) {
        session.setStartTime(LocalDateTime.now());
        return pomodoroService.saveSession(session);
    }

    @GetMapping("/{userId}")
    public List<PomodoroSession> getSessions(@PathVariable Long userId) {
        return pomodoroService.getAllSessionsForUser(userId);
    }

    @PutMapping("/{id}/complete")
    public PomodoroSession completeSession(@PathVariable Long id) {
        return pomodoroService.markAsCompleted(id);
    }

    @GetMapping("/settings/{userId}")
    public PomodoroSettings getSettings(@PathVariable Long userId) {
        return pomodoroService.getSettings(userId);
    }

    @PutMapping("/settings/{userId}")
    public PomodoroSettings update(@PathVariable Long userId, @RequestBody Map<String, Integer> body) {
        return pomodoroService.updateSettings(
                userId,
                body.get("focusDuration"),
                body.get("breakDuration")
        );
    }
}

