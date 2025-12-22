package mk.ukim.finki.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import mk.ukim.finki.backend.model.enumerations.RecurrenceType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
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

    private LocalDate startDate;
    private LocalDate dueDate;
    @Column(name = "start_time")
    private LocalTime startTime;
    @Column(name = "end_time")
    private LocalTime endTime;
    private Integer estimatedMinutes;


    @Enumerated(EnumType.STRING)
    private RecurrenceType recurrenceType;
    private Integer recurrenceInterval;
    private LocalDate recurrenceEnd;

    private boolean archived = false;

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TaskCompletion> completions = new ArrayList<>();

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL)
    @JsonManagedReference("task-subtasks")
    private List<Subtask> subtasks = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonBackReference("user-task")
    private User user;

    @ManyToMany
    @JoinTable(name = "task_tags", joinColumns = @JoinColumn(name = "task_id"), inverseJoinColumns = @JoinColumn(name = "tag_id"))
    private List<Tag> tags = new ArrayList<>();


    private LocalDateTime nextReminderAt;
    private LocalDate lastReminderSentDate;


    public boolean isOneTime() {
        return recurrenceType == RecurrenceType.NONE;
    }

    public boolean isCompleted() {
        return isOneTime() && !completions.isEmpty();
    }

    public boolean isCompletedOn(LocalDate date) {
        return completions.stream().anyMatch(c -> c.getDate().equals(date));
    }

    public boolean isActiveForToday(LocalDate today) {
        if (isOneTime()) return !isCompleted();
        return !isCompletedOn(today);
    }

    public boolean isOverdue(LocalDate today) {
        if (!isOneTime()) return false;
        if (startDate == null) return false;
        return startDate.isBefore(today) && !isCompleted();
    }

}
