package com.alumniportal.alumni.controller;

import com.alumniportal.alumni.dto.ProfileDTO;
import com.alumniportal.alumni.entity.Job;
import com.alumniportal.alumni.entity.User;
import com.alumniportal.alumni.repository.JobRepository;
import com.alumniportal.alumni.repository.UserRepository;
import com.alumniportal.alumni.service.ProfileService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/alumni")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AlumniController {

    private final ProfileService profileService;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;

    public AlumniController(ProfileService profileService,
                            UserRepository userRepository,
                            JobRepository jobRepository) {
        this.profileService = profileService;
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
    }

    /**
     * Get logged-in alumni profile
     */
    @GetMapping("/profile")
    @PreAuthorize("hasRole('ALUMNI')")
    public ResponseEntity<ProfileDTO> getAlumniProfile(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        String email = principal.getName();
        System.out.println("🔄 GET PROFILE REQUEST FOR: " + email);

        ProfileDTO profile = profileService.getProfileByEmail(email);

        if (profile == null) {
            return ResponseEntity.notFound().build();
        }

        System.out.println("✅ GET PROFILE SUCCESS: " + profile.toString());
        return ResponseEntity.ok(profile);
    }

    /**
     * Update logged-in alumni profile (JSON version - for regular updates)
     */
    @PutMapping("/profile")
    @PreAuthorize("hasRole('ALUMNI')")
    public ResponseEntity<ProfileDTO> updateAlumniProfile(@RequestBody ProfileDTO updatedProfile, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        String email = principal.getName();
        try {
            System.out.println("🔄 UPDATE PROFILE REQUEST FOR: " + email);
            System.out.println("📝 REQUEST BODY: " + updatedProfile.toString());

            ProfileDTO updated = profileService.updateProfileByEmail(email, updatedProfile);

            System.out.println("✅ UPDATE PROFILE SUCCESS: " + updated.toString());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            System.out.println("❌ UPDATE PROFILE ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Update alumni profile with file upload support
     */
    @PutMapping(value = "/profile/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ALUMNI')")
    public ResponseEntity<ProfileDTO> updateAlumniProfileWithFile(
            @RequestParam(value = "profilePhoto", required = false) MultipartFile profilePhoto,
            @RequestParam("firstName") String firstName,
            @RequestParam("lastName") String lastName,
            @RequestParam("email") String email,
            @RequestParam("phone") String phone,
            @RequestParam("graduationYear") String graduationYear,
            @RequestParam("degree") String degree,
            @RequestParam("branch") String branch,
            @RequestParam("currentCompany") String currentCompany,
            @RequestParam("position") String position,
            @RequestParam("about") String about,
            Principal principal) {

        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        String userEmail = principal.getName();
        try {
            System.out.println("🔄 UPDATE PROFILE WITH FILE UPLOAD REQUEST FOR: " + userEmail);
            System.out.println("📁 File received: " + (profilePhoto != null ? profilePhoto.getOriginalFilename() : "null"));
            System.out.println("📊 File size: " + (profilePhoto != null ? profilePhoto.getSize() : "0"));
            System.out.println("📝 Form data - Name: " + firstName + " " + lastName);

            // Create ProfileDTO
            ProfileDTO profileDTO = new ProfileDTO();
            profileDTO.setFirstName(firstName);
            profileDTO.setLastName(lastName);
            profileDTO.setEmail(email);
            profileDTO.setPhone(phone);
            profileDTO.setGraduationYear(graduationYear);
            profileDTO.setDegree(degree);
            profileDTO.setBranch(branch);
            profileDTO.setCurrentCompany(currentCompany);
            profileDTO.setPosition(position);
            profileDTO.setAbout(about);

            // Handle file upload
            String profilePhotoUrl = null;
            if (profilePhoto != null && !profilePhoto.isEmpty()) {
                try {
                    // Convert file to base64 string for storage
                    byte[] fileBytes = profilePhoto.getBytes();
                    String base64Image = java.util.Base64.getEncoder().encodeToString(fileBytes);
                    String fileType = profilePhoto.getContentType();
                    profilePhotoUrl = "data:" + fileType + ";base64," + base64Image;

                    System.out.println("✅ File converted to base64, length: " + base64Image.length());
                } catch (Exception e) {
                    System.out.println("❌ Error processing file: " + e.getMessage());
                    // Continue without photo if file processing fails
                }
            }

            profileDTO.setProfilePhoto(profilePhotoUrl);

            ProfileDTO updated = profileService.updateProfileByEmail(userEmail, profileDTO);

            System.out.println("✅ UPDATE PROFILE WITH FILE SUCCESS: " + updated.toString());
            return ResponseEntity.ok(updated);

        } catch (Exception e) {
            System.out.println("❌ UPDATE PROFILE WITH FILE ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Upload profile picture only
     */
    @PostMapping(value = "/upload-profile-picture", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ALUMNI')")
    public ResponseEntity<String> uploadProfilePicture(
            @RequestParam("profilePhoto") MultipartFile profilePhoto,
            Principal principal) {

        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        String email = principal.getName();
        try {
            System.out.println("🔄 UPLOAD PROFILE PICTURE REQUEST FOR: " + email);
            System.out.println("📁 File: " + profilePhoto.getOriginalFilename());
            System.out.println("📊 File size: " + profilePhoto.getSize());

            if (profilePhoto.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty");
            }

            // Convert file to base64
            byte[] fileBytes = profilePhoto.getBytes();
            String base64Image = java.util.Base64.getEncoder().encodeToString(fileBytes);
            String fileType = profilePhoto.getContentType();
            String profilePhotoUrl = "data:" + fileType + ";base64," + base64Image;

            // Update profile with new photo
            ProfileDTO profileDTO = new ProfileDTO();
            profileDTO.setProfilePhoto(profilePhotoUrl);
            profileService.updateProfilePhotoByEmail(email, profilePhotoUrl);

            System.out.println("✅ PROFILE PICTURE UPLOADED SUCCESSFULLY");
            return ResponseEntity.ok(profilePhotoUrl);

        } catch (Exception e) {
            System.out.println("❌ UPLOAD PROFILE PICTURE ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error uploading profile picture");
        }
    }

    /**
     * Get jobs posted by this alumni
     */
    @GetMapping("/jobs")
    @PreAuthorize("hasRole('ALUMNI')")
    public ResponseEntity<List<Job>> getAlumniJobs(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        String email = principal.getName();
        User alumni = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Alumni not found"));

        List<Job> jobs = jobRepository.findByPostedBy(alumni);
        return ResponseEntity.ok(jobs);
    }

    /**
     * Post a new job
     */
    @PostMapping("/jobs")
    @PreAuthorize("hasRole('ALUMNI')")
    public ResponseEntity<Job> postJob(@RequestBody Job jobRequest, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        String email = principal.getName();
        User alumni = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Alumni not found"));

        jobRequest.setPostedBy(alumni);
        Job savedJob = jobRepository.save(jobRequest);

        return ResponseEntity.ok(savedJob);
    }
}