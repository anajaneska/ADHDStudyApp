package mk.ukim.finki.backend.service.impl.AiServiceImpl;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class TextChunker {

    public List<String> splitByWords(String text, int maxWords) {
        String[] words = text.split("\\s+");
        List<String> chunks = new ArrayList<>();

        StringBuilder current = new StringBuilder();
        int count = 0;

        for (String w : words) {
            current.append(w).append(" ");
            count++;

            if (count >= maxWords) {
                chunks.add(current.toString().trim());
                current = new StringBuilder();
                count = 0;
            }
        }

        if (current.length() > 0) chunks.add(current.toString().trim());

        return chunks;
    }
}
