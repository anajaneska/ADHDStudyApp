package mk.ukim.finki.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
@Getter
@Setter
public class Document {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fileName;
    private String fileUrl;
    private LocalDateTime uploadedAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonBackReference(value = "user-document")
    private User user;

    @OneToOne(mappedBy = "document", cascade = CascadeType.ALL)
    @JsonManagedReference(value = "document-summary")
    private Summary summary;

    @OneToOne(mappedBy = "document", cascade = CascadeType.ALL)
    @JsonManagedReference(value = "document-flashcards")
    private Flashcards flashcards;

    @OneToOne(mappedBy = "document", cascade = CascadeType.ALL)
    @JsonManagedReference(value = "document-quiz")
    private Quiz quiz;
}
