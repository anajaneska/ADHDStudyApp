package mk.ukim.finki.backend.model.exeptions;

public class NoteDoesNotExistException extends RuntimeException{
    public NoteDoesNotExistException(Long id) {
        super("Note with ID " + id + " does not exist.");
    }
}
