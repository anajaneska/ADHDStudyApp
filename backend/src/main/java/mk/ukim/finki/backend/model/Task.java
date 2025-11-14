package mk.ukim.finki.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private LocalDateTime dueDate;
    private LocalDateTime plannedStart;
    private boolean completed = false;

    private Integer estimatedMinutes;

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL)
    @JsonManagedReference("task-subtasks")
    private List<Subtask> subtasks = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonBackReference("user-task")
    private User user;
}
