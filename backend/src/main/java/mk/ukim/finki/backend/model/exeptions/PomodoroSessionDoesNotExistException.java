package mk.ukim.finki.backend.model.exeptions;

public class PomodoroSessionDoesNotExistException extends RuntimeException{
    public PomodoroSessionDoesNotExistException(Long id) {
        super("Pomodoro session with ID " + id + " does not exist.");
    }
}
