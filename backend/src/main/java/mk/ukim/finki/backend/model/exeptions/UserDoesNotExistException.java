package mk.ukim.finki.backend.model.exeptions;

public class UserDoesNotExistException extends RuntimeException{
    public UserDoesNotExistException(Long id) {
        super("User with ID " + id + " does not exist.");
    }
}
