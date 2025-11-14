package mk.ukim.finki.backend.service.impl.AiServiceImpl;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Paths;

@Service
public class ExtractTextService {

    public String extract(String filePath) throws IOException {

        if (filePath == null) return "";

        String lower = filePath.toLowerCase();

        if (lower.endsWith(".txt")) {
            return Files.readString(Paths.get(filePath));
        }

        if (lower.endsWith(".pdf")) {
            try (PDDocument doc = PDDocument.load(new File(filePath))) {
                return new PDFTextStripper().getText(doc);
            }
        }

        if (lower.endsWith(".docx")) {
            try (FileInputStream fis = new FileInputStream(filePath);
                 XWPFDocument doc = new XWPFDocument(fis)) {

                StringBuilder sb = new StringBuilder();
                for (XWPFParagraph p : doc.getParagraphs()) {
                    sb.append(p.getText()).append("\n");
                }
                return sb.toString();
            }
        }

        return Files.readString(Paths.get(filePath));
    }
}
