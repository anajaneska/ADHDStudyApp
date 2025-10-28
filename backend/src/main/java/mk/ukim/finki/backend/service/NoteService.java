package mk.ukim.finki.backend.service;

import mk.ukim.finki.backend.model.Note;
import mk.ukim.finki.backend.model.User;
import mk.ukim.finki.backend.repository.NoteRepository;
import mk.ukim.finki.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NoteService {

    private final NoteRepository noteRepository;

    public NoteService(NoteRepository noteRepository) {
        this.noteRepository = noteRepository;
    }

    public List<Note> getAllNotesForUser(Long userId) {
        return noteRepository.findByUserId(userId);
    }

    public Note saveNote(Note note) {
        return noteRepository.save(note);
    }

    public Optional<Note> getNoteById(Long id) {
        return noteRepository.findById(id);
    }

    public void deleteNote(Long id) {
        noteRepository.deleteById(id);
    }
}
