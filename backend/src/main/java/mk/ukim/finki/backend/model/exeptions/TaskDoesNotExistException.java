package mk.ukim.finki.backend.model.exeptions;

public class TaskDoesNotExistException extends RuntimeException{
    public TaskDoesNotExistException(Long id) {
        super("Task with ID " + id + " does not exist.");
    }
}
