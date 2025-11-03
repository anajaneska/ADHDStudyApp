package mk.ukim.finki.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;


public interface AiService {
    String extractText(MultipartFile file) throws IOException;
    String summarizeTextSafely(String text,String MODEL_URL, String HUGGING_FACE_API_TOKEN) throws IOException;
    List<String> splitTextIntoChunks(String text, int maxWords);
    String callHuggingFaceApi(String text, String MODEL_URL, String HUGGING_FACE_API_TOKEN) throws IOException ;
    String toJsonString(String text);
    String parseSummary(String jsonResponse);
}
