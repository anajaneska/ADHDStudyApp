package mk.ukim.finki.backend.service.impl.AiServiceImpl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
public class SummaryServiceHF {

    private static final String MODEL_URL =
            "https://router.huggingface.co/hf-inference/models/sshleifer/distilbart-cnn-12-6";

    private final HttpClientHF http;
    private final TextChunker chunker;
    private final ObjectMapper mapper = new ObjectMapper();

    public SummaryServiceHF(HttpClientHF http, TextChunker chunker) {
        this.http = http;
        this.chunker = chunker;
    }

    public String summarize(String text) throws IOException {
        if (text == null || text.isBlank()) return "";

        List<String> chunks = chunker.splitByWords(text, 700);
        StringBuilder result = new StringBuilder();

        for (String c : chunks) {
            String resp = callModel(c);
            result.append(resp).append(" ");
        }

        String combined = result.toString().trim();

        if (combined.length() > 1500) {
            return callModel(combined);
        }

        return combined;
    }

    private String callModel(String text) throws IOException {

        String payload = "{\"inputs\": " + mapper.writeValueAsString(text) + "}";

        String json = http.postJson(MODEL_URL, payload);

        return parseSummary(json);
    }

    private String parseSummary(String json) {
        try {
            JsonNode arr = mapper.readTree(json);
            return arr.get(0).get("summary_text").asText();
        } catch (Exception e) {
            return json;
        }
    }
}

