package mk.ukim.finki.backend.model.exeptions;

public class SummaryDoesNotExistException extends RuntimeException{
    public SummaryDoesNotExistException(Long id) {
        super("Summary for file with ID " + id + " does not exist.");
    }
}

