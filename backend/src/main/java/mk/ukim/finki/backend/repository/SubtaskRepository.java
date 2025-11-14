package mk.ukim.finki.backend.repository;

import mk.ukim.finki.backend.model.Subtask;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubtaskRepository extends JpaRepository<Subtask, Long> {
}
