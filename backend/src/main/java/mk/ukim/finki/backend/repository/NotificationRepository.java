package mk.ukim.finki.backend.repository;

import mk.ukim.finki.backend.model.Notification;
import mk.ukim.finki.backend.model.enumerations.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdAndSeenFalse(Long userId);

    boolean existsByUserIdAndTypeAndMessageAndSeenFalse(
            Long userId,
            NotificationType type,
            String message
    );
}
