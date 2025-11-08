package com.alumniportal.alumni.controller;

import com.alumniportal.alumni.dto.ProfileDTO;
import com.alumniportal.alumni.service.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    /**
     * ✅ Get logged-in student's profile
     */
    @GetMapping("/profile")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ProfileDTO> getLoggedInProfile(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        String email = principal.getName();

        try {
            ProfileDTO profile = profileService.getProfileByEmail(email);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * ✅ Update logged-in student's profile - FIXED: Accepts both JSON and form data
     */
    @PutMapping(value = "/profile", consumes = {"application/json", "multipart/form-data", "application/x-www-form-urlencoded"})
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ProfileDTO> updateLoggedInProfile(@RequestBody ProfileDTO updatedProfile, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        String email = principal.getName();

        try {
            ProfileDTO updated = profileService.updateProfileByEmail(email, updatedProfile);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * ✅ Test endpoint
     */
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Backend is working!");
    }
}