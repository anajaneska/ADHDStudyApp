package mk.ukim.finki.backend.web;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.backend.model.PomodoroSession;
import mk.ukim.finki.backend.repository.PomodoroSessionRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/pomodoro")
@RequiredArgsConstructor
public class PomodoroController {
    private final PomodoroSessionRepository repository;

    @PostMapping("/start")
    public PomodoroSession startSession(@RequestBody PomodoroSession session) {
        session.setStartTime(LocalDateTime.now());
        return repository.save(session);
    }

    @GetMapping("/{userId}")
    public List<PomodoroSession> getSessions(@PathVariable Long userId) {
        return repository.findByUserId(userId);
    }

    @PutMapping("/{id}/complete")
    public PomodoroSession completeSession(@PathVariable Long id) {
        PomodoroSession session = repository.findById(id).orElseThrow();
        session.setCompleted(true);
        session.setEndTime(LocalDateTime.now());
        return repository.save(session);
    }
}

