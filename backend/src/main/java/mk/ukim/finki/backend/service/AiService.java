package mk.ukim.finki.backend.service;

import org.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;


public interface AiService {
    List<String> splitTextIntoChunks(String text, int maxWords);
    String callHuggingFaceApi(String text, String MODEL_URL) throws IOException ;
    String toJsonString(String text);
    String generateFlashcards(String text) throws IOException;
    String extractTextFromDocument(String filePath) throws IOException;
    String summarize(String text) throws IOException;

    String generateQuiz(String text) throws IOException;
    //String generateQuiz(String text) throws IOException;
    //String callHuggingFaceApiWithParams(String text, String modelUrl, int maxNewTokens) throws IOException;

    //String callHuggingFaceApiInternal(JSONObject json, String modelUrl) throws IOException;
}
