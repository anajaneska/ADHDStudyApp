package mk.ukim.finki.backend.web;

import mk.ukim.finki.backend.model.Note;
import mk.ukim.finki.backend.model.User;
import mk.ukim.finki.backend.service.NoteService;
import mk.ukim.finki.backend.service.UserService;
import org.apache.tomcat.util.net.openssl.ciphers.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "http://localhost:3000")
public class NoteController {

    private final NoteService noteService;
    private final UserService userService;

    public NoteController(NoteService noteService, UserService userService) {
        this.noteService = noteService;
        this.userService = userService;
    }

    @GetMapping("/{userId}")
    public List<Note> getNotes(@PathVariable Long userId) {
        return noteService.getAllNotesForUser(userId);
    }

    @PostMapping("/{userId}")
    public Note createNote(@PathVariable Long userId, @RequestBody Note note) {
        User user = userService.getUserById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        note.setUser(user);
        Note savedNote = noteService.saveNote(note);
        return savedNote;
    }

    @PutMapping("/{id}")
    public Note updateNote(@PathVariable Long id, @RequestBody Note updatedNote) {
        return noteService.getNoteById(id).map(note -> {
            note.setTitle(updatedNote.getTitle());
            note.setContent(updatedNote.getContent());
            return noteService.saveNote(note);
        }).orElseThrow(() -> new RuntimeException("Note not found"));
    }

    @DeleteMapping("/{userId}/{id}")
    public void deleteNote(@PathVariable Long userId, @PathVariable Long id) {
        noteService.deleteNote(id);
    }
}