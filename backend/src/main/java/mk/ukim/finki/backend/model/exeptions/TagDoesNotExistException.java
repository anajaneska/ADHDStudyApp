package mk.ukim.finki.backend.model.exeptions;

public class TagDoesNotExistException extends RuntimeException{
    public TagDoesNotExistException(Long id) {
        super("Tag with ID " + id + " does not exist.");
    }
}
