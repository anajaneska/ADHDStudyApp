package mk.ukim.finki.backend.model.exeptions;

public class FlashcardsDoNotExistException extends RuntimeException{
    public FlashcardsDoNotExistException(Long id) {
        super("Flashcards for file with ID " + id + " do not exist.");
    }
}