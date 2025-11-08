package com.alumniportal.alumni.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService() {
        this.fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create upload directory", ex);
        }
    }

    public String storeFile(MultipartFile file, Long userId) {
        try {
            // Generate unique filename
            String fileName = "profile_" + userId + "_" + UUID.randomUUID() +
                    getFileExtension(file.getOriginalFilename());

            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation);

            return "/uploads/" + fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + file.getOriginalFilename(), ex);
        }
    }

    public String storeBase64Image(String base64Data, Long userId) {
        try {
            // Generate unique filename
            String fileName = "profile_" + userId + "_" + UUID.randomUUID() + ".jpg";

            // Remove data URL prefix if present
            String base64Image = base64Data.split(",")[1];
            byte[] imageBytes = java.util.Base64.getDecoder().decode(base64Image);

            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.write(targetLocation, imageBytes);

            return "/uploads/" + fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store base64 image", ex);
        }
    }

    private String getFileExtension(String fileName) {
        if (fileName == null) return ".jpg";
        int lastIndex = fileName.lastIndexOf(".");
        if (lastIndex == -1) return ".jpg";
        return fileName.substring(lastIndex);
    }
}