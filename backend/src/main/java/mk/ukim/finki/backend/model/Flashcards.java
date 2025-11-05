package mk.ukim.finki.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "flashcards")
@Getter
@Setter
public class Flashcards {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String flashcardData; // JSON array of {question, answer}

    @OneToOne
    @JoinColumn(name = "document_id")
    @JsonBackReference(value = "document-flashcards")
    private Document document;

    private int numberOfFlashcards;
}
