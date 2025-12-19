package mk.ukim.finki.backend.repository;

import mk.ukim.finki.backend.model.TaskCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskCompletionRepository extends JpaRepository<TaskCompletion, Long> {

    boolean existsByTaskIdAndDate(Long taskId, LocalDate date);

    List<TaskCompletion> findByTaskId(Long taskId);
}