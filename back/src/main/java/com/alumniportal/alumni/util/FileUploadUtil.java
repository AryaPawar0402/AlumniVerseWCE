package com.alumniportal.alumni.util;

import java.io.*;
import java.nio.file.*;

public class FileUploadUtil {
    public static String saveFile(String uploadDir, String fileName, InputStream inputStream) throws IOException {
        Path uploadPath = Paths.get(uploadDir);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path filePath = uploadPath.resolve(fileName);
        try (OutputStream outputStream = Files.newOutputStream(filePath)) {
            inputStream.transferTo(outputStream);
        }

        // ✅ Return web-accessible path
        return uploadDir + "/" + fileName;
    }
}