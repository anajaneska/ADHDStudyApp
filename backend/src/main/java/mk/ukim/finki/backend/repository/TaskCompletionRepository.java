package mk.ukim.finki.backend.repository;

import mk.ukim.finki.backend.model.Task;
import mk.ukim.finki.backend.model.TaskCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaskCompletionRepository extends JpaRepository<TaskCompletion, Long> {

    boolean existsByTaskIdAndDate(Long taskId, LocalDate date);

    List<TaskCompletion> findByTaskId(Long taskId);
    boolean existsByTaskAndDate(Task task, LocalDate date);

    List<TaskCompletion> findByTask(Task task);
    Optional<TaskCompletion> findByTaskAndDate(Task task, LocalDate date);

    @Query("""
        SELECT tc FROM TaskCompletion tc
        WHERE tc.date = :date AND tc.completed = true
    """)
    List<TaskCompletion> findAllCompletedForDate(@Param("date") LocalDate date);
}