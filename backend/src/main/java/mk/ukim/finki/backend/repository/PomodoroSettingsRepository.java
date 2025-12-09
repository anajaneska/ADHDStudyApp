package mk.ukim.finki.backend.repository;

import mk.ukim.finki.backend.model.PomodoroSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PomodoroSettingsRepository extends JpaRepository<PomodoroSettings, Long> {
    Optional<PomodoroSettings> findByUserId(Long userId);
}