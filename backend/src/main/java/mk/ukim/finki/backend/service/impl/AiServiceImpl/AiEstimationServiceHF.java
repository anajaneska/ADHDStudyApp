package mk.ukim.finki.backend.service.impl.AiServiceImpl;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AiEstimationServiceHF {

    private final ChatModelServiceHF chatModelServiceHF;
    private final Logger log = LoggerFactory.getLogger(AiEstimationServiceHF.class);

    public int estimateMinutes(String title, String description) {
        String prompt = """
            You are an AI that estimates time required for tasks.
            Return ONLY a number in minutes. No words, no labels.

            Example output:
            45

            Title: %s
            Description: %s
            """.formatted(safe(title), safe(description));

        try {
            // Use the correct endpoint FOR ESTIMATION
            String raw = chatModelServiceHF.generateEstimation(prompt);
            if (raw == null) raw = "";

            log.debug("HF raw estimation response: {}", raw);

            Integer n = extractFirstInteger(raw);
            if (n != null) return clamp(n, 5, 480);

            Integer floatN = extractFloatLikeAsInt(raw);
            if (floatN != null) return clamp(floatN, 5, 480);

            int heuristic = heuristicEstimate(title, description);
            log.warn("HF returned no number. Heuristic used: {}. Raw: {}", heuristic, raw);
            return clamp(heuristic, 5, 480);

        } catch (Exception ex) {
            log.error("HF estimation failed", ex);
            return clamp(heuristicEstimate(title, description), 5, 480);
        }
    }

    private String safe(String s) { return s == null ? "" : s; }

    private Integer extractFirstInteger(String s) {
        Pattern p = Pattern.compile("\\b(\\d{1,4})\\b");
        Matcher m = p.matcher(s);
        if (m.find()) return Integer.parseInt(m.group(1));
        return null;
    }

    private Integer extractFloatLikeAsInt(String s) {
        Pattern pHour = Pattern.compile("\\b(\\d+(?:\\.\\d+)?)\\s*(hours|hour|h)\\b");
        Matcher mHour = pHour.matcher(s);
        if (mHour.find()) return (int)Math.round(Double.parseDouble(mHour.group(1)) * 60);

        Pattern p = Pattern.compile("\\b(\\d+(?:\\.\\d+)?)\\b");
        Matcher m = p.matcher(s);
        if (m.find()) return (int)Math.round(Double.parseDouble(m.group(1)));

        return null;
    }

    private int heuristicEstimate(String title, String desc) {
        int base = 10;
        int len = (title + " " + desc).length();
        base += Math.min(120, len / 10);
        if (desc.toLowerCase().contains("research")) base += 30;
        return base;
    }

    private int clamp(int v, int min, int max) {
        return Math.max(min, Math.min(max, v));
    }
}
