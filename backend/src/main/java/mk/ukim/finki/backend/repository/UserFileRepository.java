package mk.ukim.finki.backend.repository;

import mk.ukim.finki.backend.model.UserFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserFileRepository extends JpaRepository<UserFile, Long> {
    List<UserFile> findByUserId(String userId);
}