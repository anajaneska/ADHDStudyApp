package mk.ukim.finki.backend.repository;

import mk.ukim.finki.backend.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUserId(Long userId);
    List<Task> findByUserIdAndArchivedFalse(Long userId);

    List<Task> findByArchivedFalse();

    List<Task> findByNextReminderAtBefore(LocalDateTime time);
}
