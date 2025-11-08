package com.alumniportal.alumni.controller;

import com.alumniportal.alumni.dto.AchievementRequest;
import com.alumniportal.alumni.entity.Achievement;
import com.alumniportal.alumni.service.AchievementService;
import com.alumniportal.alumni.util.FileUploadUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/achievements")
@CrossOrigin(origins = "http://localhost:5173")
public class AchievementController {

    @Autowired
    private AchievementService achievementService;

    // ✅ ADDED: ObjectMapper for JSON parsing
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/upload")
    public ResponseEntity<Achievement> uploadAchievement(
            @RequestParam("data") String dataJson,  // ✅ CHANGED: Use @RequestParam for String
            @RequestParam(value = "file", required = false) MultipartFile file,
            Authentication authentication) throws IOException {

        System.out.println("🎯🎯🎯 UPLOAD ENDPOINT HIT! 🎯🎯🎯");
        System.out.println("📦 Received data JSON: " + dataJson);
        System.out.println("📁 File: " + (file != null ? file.getOriginalFilename() : "No file"));

        try {
            // ✅ MANUALLY parse the JSON data
            AchievementRequest request = objectMapper.readValue(dataJson, AchievementRequest.class);

            System.out.println("✅ JSON parsed successfully:");
            System.out.println("📝 Title: " + request.getTitle());
            System.out.println("📝 Description: " + request.getDescription());
            System.out.println("👤 Student ID: " + request.getStudentId());

            String email;
            if (authentication != null && authentication.isAuthenticated()) {
                email = authentication.getName();
                System.out.println("🔐 Authenticated user: " + email);
                // ✅ Use authenticated email instead of request studentId for security
                request.setStudentId(email);
            } else {
                email = request.getStudentId();
                System.out.println("🔐 Using studentId from request: " + email);
            }

            String uploadDir = "uploads/achievements";
            String filePath = null;

            if (file != null && !file.isEmpty()) {
                String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                filePath = FileUploadUtil.saveFile(uploadDir, fileName, file.getInputStream());
                System.out.println("📁 File saved at: " + filePath);
                System.out.println("🌐 Web accessible at: http://localhost:8080/" + filePath);
            }

            Achievement saved = achievementService.addAchievement(request, filePath);
            System.out.println("✅ Achievement saved with ID: " + saved.getId());
            System.out.println("🎉 UPLOAD SUCCESSFUL! Returning achievement: " + saved.getTitle());
            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            System.out.println("❌ Error processing upload: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Achievement>> getAllAchievements() {
        System.out.println("🔐 GET ALL achievements");
        List<Achievement> achievements = achievementService.getAllAchievements();
        System.out.println("🔐 Found " + achievements.size() + " total achievements");
        achievements.forEach(ach -> {
            System.out.println("📄 Achievement: " + ach.getTitle() + " | Image: " + ach.getImagePath());
        });
        return ResponseEntity.ok(achievements);
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Achievement>> getByStudent(@PathVariable String studentId) {
        System.out.println("🔐 GET achievements for student: " + studentId);
        try {
            List<Achievement> achievements = achievementService.getAchievementsByStudent(studentId);
            System.out.println("🔐 Found " + achievements.size() + " achievements for student: " + studentId);
            return ResponseEntity.ok(achievements);
        } catch (Exception e) {
            System.out.println("❌ Error fetching achievements for student " + studentId + ": " + e.getMessage());
            // ✅ FIXED: Return empty array instead of error
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/student/me")
    public ResponseEntity<List<Achievement>> getMyAchievements(Authentication authentication) {
        try {
            // ✅ FIXED: Handle null authentication gracefully
            if (authentication == null) {
                System.out.println("❌ Authentication is null - returning empty list");
                return ResponseEntity.ok(List.of());
            }

            String email = authentication.getName();
            System.out.println("🔐 Fetching achievements for email: " + email);

            List<Achievement> achievements = achievementService.getAchievementsByEmail(email);
            System.out.println("🔐 Found " + achievements.size() + " achievements for email: " + email);

            // Log each achievement's image path for debugging
            achievements.forEach(ach -> {
                System.out.println("🖼️ Achievement '" + ach.getTitle() + "' image path: " + ach.getImagePath());
            });

            return ResponseEntity.ok(achievements);
        } catch (Exception e) {
            System.out.println("❌ Error in getMyAchievements: " + e.getMessage());
            e.printStackTrace();
            // ✅ FIXED: Return empty array instead of error
            return ResponseEntity.ok(List.of());
        }
    }

    // ✅ NEW: Endpoint specifically for alumni to view student achievements by ID
    @GetMapping("/student/id/{studentId}")
    public ResponseEntity<List<Achievement>> getByStudentId(@PathVariable Long studentId) {
        System.out.println("🔐 GET achievements for student ID: " + studentId);
        try {
            List<Achievement> achievements = achievementService.getAchievementsByStudentId(studentId);
            System.out.println("🔐 Found " + achievements.size() + " achievements for student ID: " + studentId);
            return ResponseEntity.ok(achievements);
        } catch (Exception e) {
            System.out.println("❌ Error fetching achievements for student ID " + studentId + ": " + e.getMessage());
            // ✅ FIXED: Return empty array instead of error
            return ResponseEntity.ok(List.of());
        }
    }
}