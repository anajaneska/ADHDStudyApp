package mk.ukim.finki.backend.service;

import mk.ukim.finki.backend.model.PomodoroSession;

import java.util.List;
import java.util.Optional;

public interface PomodoroService {
    List<PomodoroSession> getAllSessionsForUser(Long userId);
    PomodoroSession saveSession(PomodoroSession session);
    Optional<PomodoroSession> getSessionById(Long id);
    void deleteSession(Long id);
    PomodoroSession markAsCompleted(Long id);
}
