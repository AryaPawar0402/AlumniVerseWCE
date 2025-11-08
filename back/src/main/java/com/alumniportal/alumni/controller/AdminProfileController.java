package com.alumniportal.alumni.controller;

import com.alumniportal.alumni.dto.ProfileDTO;
import com.alumniportal.alumni.service.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AdminProfileController {

    private final ProfileService profileService;

    public AdminProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    /**
     * Fetch logged-in admin profile
     */
    @GetMapping("/profile")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProfileDTO> getAdminProfile(Authentication authentication) {
        System.out.println("🎯 AdminProfileController GET called - Authentication: " + authentication);

        if (authentication == null) {
            System.out.println("❌ Authentication is null → Unauthorized access");
            return ResponseEntity.status(401).build();
        }

        String email = authentication.getName(); // Email from JWT
        System.out.println("🎯 Fetching admin profile for: " + email);

        try {
            ProfileDTO profile = profileService.getProfileByEmail(email);
            System.out.println("✅ Admin profile found: " + profile.getFirstName() + " " + profile.getLastName());
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            System.out.println("❌ Error fetching admin profile: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Update logged-in admin profile
     */
    @PutMapping("/profile")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProfileDTO> updateAdminProfile(
            @RequestBody ProfileDTO updatedProfile,
            Authentication authentication) {

        System.out.println("🎯 AdminProfileController PUT called - Authentication: " + authentication);

        if (authentication == null) {
            System.out.println("❌ Authentication is null → Unauthorized access");
            return ResponseEntity.status(401).build();
        }

        String email = authentication.getName(); // Email from JWT
        System.out.println("🎯 Updating admin profile for: " + email);
        System.out.println("🎯 Update data: " + updatedProfile);

        try {
            ProfileDTO updated = profileService.updateProfileByEmail(email, updatedProfile);
            System.out.println("✅ Admin profile updated successfully: " + updated.getFirstName() + " " + updated.getLastName());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            System.out.println("❌ Error updating admin profile: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    // Optional test endpoint
    @GetMapping("/test")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> test() {
        System.out.println("🎯 Admin test endpoint hit!");
        return ResponseEntity.ok("Admin backend is working!");
    }
}
