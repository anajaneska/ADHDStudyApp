package mk.ukim.finki.backend.service.impl.AiServiceImpl;

import mk.ukim.finki.backend.service.AiService;

import mk.ukim.finki.backend.service.impl.AiServiceImpl.ChatModelServiceHF;
import mk.ukim.finki.backend.service.impl.AiServiceImpl.ExtractTextService;
import mk.ukim.finki.backend.service.impl.AiServiceImpl.SummaryServiceHF;
import org.springframework.stereotype.Service;

@Service
public class AiServiceImpl implements AiService {

    private final ExtractTextService extractor;
    private final SummaryServiceHF summarizer;
    private final ChatModelServiceHF chat;

    public AiServiceImpl(
            ExtractTextService extractor,
            SummaryServiceHF summarizer,
            ChatModelServiceHF chat
    ) {
        this.extractor = extractor;
        this.summarizer = summarizer;
        this.chat = chat;
    }

    @Override
    public String extractTextFromDocument(String path) throws java.io.IOException {
        return extractor.extract(path);
    }

    @Override
    public String summarize(String text) throws java.io.IOException {
        return summarizer.summarize(text);
    }

    @Override
    public String generateFlashcards(String text) throws java.io.IOException {
        return chat.generateFlashcards(text);
    }

    @Override
    public String generateQuiz(String text) throws java.io.IOException {
        return chat.generateQuiz(text);
    }
}
