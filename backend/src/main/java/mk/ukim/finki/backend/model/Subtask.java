package mk.ukim.finki.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "subtasks")
public class Subtask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private boolean completed = false;
    private Integer estimatedMinutes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    @JsonBackReference("task-subtasks")
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_subtask_id")
    @JsonBackReference("subtask-parent")
    private Subtask parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    @JsonManagedReference("subtask-children")
    private List<Subtask> children = new ArrayList<>();
}
