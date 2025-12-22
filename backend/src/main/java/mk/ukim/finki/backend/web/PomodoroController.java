package mk.ukim.finki.backend.web;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.backend.model.PomodoroSettings;
import mk.ukim.finki.backend.service.PomodoroService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/pomodoro")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class PomodoroController {
    private final PomodoroService pomodoroService;


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

