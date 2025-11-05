package mk.ukim.finki.backend.service;

import mk.ukim.finki.backend.model.Document;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface FileService {
    Document uploadFile(MultipartFile file, Long userId);
    List<Document> getUserFiles(Long userId);
}