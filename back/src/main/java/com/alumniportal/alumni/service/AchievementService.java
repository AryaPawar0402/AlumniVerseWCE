package com.alumniportal.alumni.service;

import com.alumniportal.alumni.dto.AchievementRequest;
import com.alumniportal.alumni.entity.Achievement;
import com.alumniportal.alumni.entity.User;
import com.alumniportal.alumni.repository.AchievementRepository;
import com.alumniportal.alumni.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AchievementService {

    @Autowired
    private AchievementRepository achievementRepository;

    @Autowired
    private UserRepository userRepository; // ✅ ADDED: UserRepository to map ID to email

    // Add achievement (with optional file path)
    public Achievement addAchievement(AchievementRequest request, String imagePath) {
        System.out.println("🔐 Adding achievement for studentId: " + request.getStudentId());
        System.out.println("🔐 Title: " + request.getTitle());
        System.out.println("🔐 Description: " + request.getDescription());
        System.out.println("🔐 Image Path: " + imagePath);

        Achievement achievement = new Achievement(
                request.getStudentId(),
                request.getTitle(),
                request.getDescription(),
                imagePath
        );

        // ✅ Set studentEmail for querying
        achievement.setStudentEmail(request.getStudentId());

        Achievement saved = achievementRepository.save(achievement);
        System.out.println("✅ Achievement saved with ID: " + saved.getId());
        return saved;
    }

    public List<Achievement> getAllAchievements() {
        return achievementRepository.findAll();
    }

    // ✅ FIXED: Return empty list instead of throwing exception
    public List<Achievement> getAchievementsByStudent(String studentId) {
        System.out.println("🔐 Searching achievements for student ID: " + studentId);
        List<Achievement> list = achievementRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
        System.out.println("🔐 Found " + list.size() + " achievements for student ID: " + studentId);
        return list; // Return empty list if no achievements found
    }

    // ✅ FIXED: Return empty list instead of throwing exception
    public List<Achievement> getAchievementsByEmail(String email) {
        System.out.println("🔐 Searching achievements for email: " + email);
        List<Achievement> list = achievementRepository.findByStudentEmailOrderByCreatedAtDesc(email);
        System.out.println("🔐 Found " + list.size() + " achievements for email: " + email);
        return list; // Return empty list if no achievements found
    }

    // ✅ FIXED: Get achievements by student ID (Long) for alumni view - PROPERLY IMPLEMENTED
    public List<Achievement> getAchievementsByStudentId(Long studentId) {
        System.out.println("🔐 ===== SEARCHING ACHIEVEMENTS FOR STUDENT ID: " + studentId + " =====");

        try {
            // Step 1: Get student by ID to find their email
            User student = userRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found with ID: " + studentId));

            String studentEmail = student.getEmail();
            System.out.println("🔐 Found student email: " + studentEmail + " for ID: " + studentId);

            // Step 2: Search achievements by email (since achievements are stored with email)
            List<Achievement> achievements = achievementRepository.findByStudentEmailOrderByCreatedAtDesc(studentEmail);
            System.out.println("🔐 Found " + achievements.size() + " achievements by email: " + studentEmail);

            // Step 3: If no achievements found by email, try by ID as string
            if (achievements.isEmpty()) {
                System.out.println("🔐 No achievements found by email, trying by student ID as string...");
                achievements = achievementRepository.findByStudentIdOrderByCreatedAtDesc(studentId.toString());
                System.out.println("🔐 Found " + achievements.size() + " achievements by ID string: " + studentId);
            }

            // Step 4: If still no achievements, try the combined query
            if (achievements.isEmpty()) {
                System.out.println("🔐 No achievements found by ID string, trying combined query...");
                achievements = achievementRepository.findByStudentIdOrEmail(studentEmail);
                System.out.println("🔐 Found " + achievements.size() + " achievements by combined query: " + studentEmail);
            }

            System.out.println("🔐 ===== TOTAL ACHIEVEMENTS FOUND: " + achievements.size() + " =====");
            return achievements;

        } catch (Exception e) {
            System.out.println("🔐 Error finding student achievements: " + e.getMessage());
            e.printStackTrace();
            return List.of(); // Return empty list on error
        }
    }
}