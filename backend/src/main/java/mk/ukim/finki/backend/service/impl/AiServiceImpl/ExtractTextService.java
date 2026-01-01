package mk.ukim.finki.backend.service.impl.AiServiceImpl;

import mk.ukim.finki.backend.model.Document;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class ExtractTextService {

    public String loadFileText(Document document) throws IOException {
        Path filePath = Paths.get(document.getFileUrl());
        String fileName = filePath.getFileName().toString().toLowerCase();

        if (fileName.endsWith(".txt")) {
            return Files.readString(filePath, StandardCharsets.UTF_8);
        }

        if (fileName.endsWith(".pdf")) {
            try (PDDocument pdf = PDDocument.load(filePath.toFile())) {
                return new PDFTextStripper().getText(pdf);
            }
        }

        if (fileName.endsWith(".docx")) {
            try (FileInputStream fis = new FileInputStream(filePath.toFile());
                 XWPFDocument docx = new XWPFDocument(fis);
                 XWPFWordExtractor extractor = new XWPFWordExtractor(docx)) {
                return extractor.getText();
            }
        }

        return Files.readString(filePath, StandardCharsets.UTF_8);
    }
}
