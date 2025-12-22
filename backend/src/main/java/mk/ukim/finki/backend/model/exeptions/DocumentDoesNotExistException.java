package mk.ukim.finki.backend.model.exeptions;

public class DocumentDoesNotExistException extends RuntimeException{
    public DocumentDoesNotExistException(Long id) {
        super("Document with ID " + id + " does not exist.");
    }
}