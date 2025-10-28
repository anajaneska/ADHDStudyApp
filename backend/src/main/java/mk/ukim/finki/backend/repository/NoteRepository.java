package mk.ukim.finki.backend.repository;

import mk.ukim.finki.backend.model.Note;
import mk.ukim.finki.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByUserId(Long userId);
}
