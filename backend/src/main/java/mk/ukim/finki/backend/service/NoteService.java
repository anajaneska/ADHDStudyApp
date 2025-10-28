package mk.ukim.finki.backend.service;

import mk.ukim.finki.backend.model.Note;
import mk.ukim.finki.backend.model.User;
import mk.ukim.finki.backend.model.exeptions.NoteDoesNotExistException;
import mk.ukim.finki.backend.repository.NoteRepository;
import mk.ukim.finki.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

public interface NoteService {
    List<Note> getAllNotesForUser(Long userId);
    Note saveNote(Note note);
    Optional<Note> getNoteById(Long id);
    void deleteNote(Long id);
    Note updateNote(Long id, Note updatedNote) throws NoteDoesNotExistException;
}
