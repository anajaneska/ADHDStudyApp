package mk.ukim.finki.backend.model.exeptions;

public class UsernameAlreadyExistsException extends Exception{
    public UsernameAlreadyExistsException(String username) {
        super("User with username " + username + " already exists.");
    }
}
