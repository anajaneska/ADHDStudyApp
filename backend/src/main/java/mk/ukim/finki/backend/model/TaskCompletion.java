package mk.ukim.finki.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "task_completions",
        uniqueConstraints = @UniqueConstraint(columnNames = {"task_id", "date"}))
@Getter
@Setter
public class TaskCompletion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "task_id")
    @JsonIgnore
    private Task task;

    private LocalDate date;

    private LocalDateTime completedAt;
}

