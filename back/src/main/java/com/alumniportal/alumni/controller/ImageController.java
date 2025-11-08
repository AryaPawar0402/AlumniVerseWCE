package com.alumniportal.alumni.controller;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = "http://localhost:5173")
public class ImageController {

    @GetMapping("/achievements/{filename:.+}")
    public ResponseEntity<InputStreamResource> getAchievementImage(@PathVariable String filename) {
        try {
            // Handle URL encoded filenames (spaces become %20)
            String decodedFilename = java.net.URLDecoder.decode(filename, "UTF-8");

            String uploadsDir = "uploads/achievements";
            Path filePath = Paths.get(uploadsDir, decodedFilename);

            System.out.println("🖼️ Attempting to serve image: " + filePath.toAbsolutePath());
            System.out.println("🖼️ File exists: " + Files.exists(filePath));

            if (!Files.exists(filePath)) {
                System.out.println("❌ File not found: " + filePath.toAbsolutePath());
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            // Check file size and type
            long fileSize = Files.size(filePath);
            System.out.println("🖼️ File size: " + fileSize + " bytes");

            if (fileSize == 0) {
                System.out.println("❌ File is empty: " + filePath.getFileName());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }

            FileInputStream fis = new FileInputStream(filePath.toFile());
            InputStreamResource resource = new InputStreamResource(fis);

            // Determine content type
            String contentType = determineContentType(decodedFilename);
            System.out.println("✅ Serving image: " + decodedFilename + " as " + contentType);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .contentLength(fileSize)
                    .header("Cache-Control", "public, max-age=3600")
                    .body(resource);

        } catch (FileNotFoundException e) {
            System.out.println("❌ File not found: " + e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.out.println("❌ Error serving image: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private String determineContentType(String filename) {
        if (filename.toLowerCase().endsWith(".png")) return "image/png";
        if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) return "image/jpeg";
        if (filename.toLowerCase().endsWith(".gif")) return "image/gif";
        if (filename.toLowerCase().endsWith(".bmp")) return "image/bmp";
        if (filename.toLowerCase().endsWith(".webp")) return "image/webp";
        return "application/octet-stream";
    }

    // Test endpoint to verify controller is working
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("✅ Image controller is working!");
    }
}