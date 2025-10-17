package mk.ukim.finki.backend.repository;

import mk.ukim.finki.backend.model.PomodoroSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PomodoroSessionRepository extends JpaRepository<PomodoroSession, Long> {
    List<PomodoroSession> findByUserId(Long userId);
}

