package mk.ukim.finki.backend.service;

import mk.ukim.finki.backend.model.PomodoroSession;
import mk.ukim.finki.backend.model.PomodoroSettings;

import java.util.List;
import java.util.Optional;

public interface PomodoroService {
    List<PomodoroSession> getAllSessionsForUser(Long userId);
    PomodoroSession saveSession(PomodoroSession session);
    PomodoroSession markAsCompleted(Long id);
    PomodoroSettings updateSettings(Long userId, int focus, int brk);
    PomodoroSettings getSettings(Long userId);
}
