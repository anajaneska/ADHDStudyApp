package mk.ukim.finki.backend.model.exeptions;

public class QuizDoesNotExistException extends RuntimeException{
    public QuizDoesNotExistException(Long id) {
        super("Quiz for file with ID " + id + " does not exist.");
    }
}