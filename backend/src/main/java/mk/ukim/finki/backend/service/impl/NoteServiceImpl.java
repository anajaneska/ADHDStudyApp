package mk.ukim.finki.backend.service.impl;

import mk.ukim.finki.backend.model.Note;
import mk.ukim.finki.backend.model.exeptions.NoteDoesNotExistException;
import mk.ukim.finki.backend.repository.NoteRepository;
import mk.ukim.finki.backend.service.NoteService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NoteServiceImpl implements NoteService {
    private final NoteRepository noteRepository;

    public NoteServiceImpl(NoteRepository noteRepository) {
        this.noteRepository = noteRepository;
    }
    @Override
    public List<Note> getAllNotesForUser(Long userId) {
        return noteRepository.findByUserId(userId);
    }
    @Override
    public Note saveNote(Note note) {
        return noteRepository.save(note);
    }
    @Override
    public Optional<Note> getNoteById(Long id) {
        return noteRepository.findById(id);
    }
    @Override
    public void deleteNote(Long id) {
        noteRepository.deleteById(id);
    }

    @Override
    public Note updateNote(Long id, Note updatedNote) throws NoteDoesNotExistException {
        return noteRepository.findById(id)
                .map(note -> {
                    note.setTitle(updatedNote.getTitle());
                    note.setContent(updatedNote.getContent());
                    return noteRepository.save(note);
                })
                .orElseThrow(() -> new NoteDoesNotExistException(updatedNote.getId()));
    }
}
