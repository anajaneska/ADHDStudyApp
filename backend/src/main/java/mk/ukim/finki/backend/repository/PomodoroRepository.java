package mk.ukim.finki.backend.repository;

import mk.ukim.finki.backend.model.PomodoroSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PomodoroRepository extends JpaRepository<PomodoroSession, Long> {
    List<PomodoroSession> findByUserId(Long userId);
}

