package com.alumniportal.alumni.service;

import com.alumniportal.alumni.dto.ProfileDTO;
import com.alumniportal.alumni.entity.Profile;
import com.alumniportal.alumni.entity.User;
import com.alumniportal.alumni.repository.ProfileRepository;
import com.alumniportal.alumni.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;

    public ProfileService(ProfileRepository profileRepository, UserRepository userRepository) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
    }

    // ✅ Get Profile by Email
    public ProfileDTO getProfileByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        Profile profile = user.getProfile();
        if (profile == null) {
            profile = createDefaultProfile(user);
        }

        ProfileDTO dto = convertToDTO(profile);
        System.out.println("📤 Returning profile with photo: " + (dto.getProfilePhoto() != null ? dto.getProfilePhoto() : "NULL"));
        return dto;
    }

    // ✅ FIXED: Update Profile by Email - Now properly handles photo deletion
    public ProfileDTO updateProfileByEmail(String email, ProfileDTO updatedProfileDTO) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        Profile profile = user.getProfile();
        if (profile == null) {
            profile = createDefaultProfile(user);
        }

        System.out.println("🔄 Updating profile for user: " + email);
        System.out.println("📝 Profile photo in request: " + (updatedProfileDTO.getProfilePhoto() != null ? "PRESENT" : "NULL/EMPTY"));

        // --- Basic info ---
        if (updatedProfileDTO.getFirstName() != null) {
            profile.setFirstName(updatedProfileDTO.getFirstName());
        }
        if (updatedProfileDTO.getLastName() != null) {
            profile.setLastName(updatedProfileDTO.getLastName());
        }
        if (updatedProfileDTO.getPhone() != null) {
            profile.setPhone(updatedProfileDTO.getPhone());
        }
        if (updatedProfileDTO.getBatch() != null) {
            profile.setBatch(updatedProfileDTO.getBatch());
        }
        if (updatedProfileDTO.getAbout() != null) {
            profile.setAbout(updatedProfileDTO.getAbout());
        }

        // --- Academic & Professional ---
        if (updatedProfileDTO.getGraduationYear() != null) {
            profile.setGraduationYear(updatedProfileDTO.getGraduationYear());
        }
        if (updatedProfileDTO.getDegree() != null) {
            profile.setDegree(updatedProfileDTO.getDegree());
        }
        if (updatedProfileDTO.getBranch() != null) {
            profile.setBranch(updatedProfileDTO.getBranch());
        }
        if (updatedProfileDTO.getCurrentCompany() != null) {
            profile.setCurrentCompany(updatedProfileDTO.getCurrentCompany());
        }
        if (updatedProfileDTO.getPosition() != null) {
            profile.setPosition(updatedProfileDTO.getPosition());
        }

        // ✅ FIXED: Handle profile photo deletion when empty string is sent
        if (updatedProfileDTO.getProfilePhoto() != null && updatedProfileDTO.getProfilePhoto().isEmpty()) {
            System.out.println("🗑️ Deleting profile photo (empty string received)...");

            // Delete the physical file if it exists
            if (profile.getProfilePhoto() != null && !profile.getProfilePhoto().isEmpty()) {
                try {
                    deleteProfilePhotoFile(profile.getProfilePhoto());
                    System.out.println("✅ Physical photo file deleted");
                } catch (Exception e) {
                    System.err.println("⚠️ Could not delete physical file: " + e.getMessage());
                }
            }

            // Set profile photo to empty string in database
            profile.setProfilePhoto("");
            System.out.println("✅ Profile photo set to empty in database");

        } else if (updatedProfileDTO.getProfilePhoto() != null && updatedProfileDTO.getProfilePhoto().startsWith("data:image")) {
            // Handle new photo upload
            try {
                System.out.println("💾 Storing new profile photo as file...");
                String filePath = storeBase64Image(updatedProfileDTO.getProfilePhoto(), user.getId());
                profile.setProfilePhoto(filePath);
                System.out.println("✅ New profile photo stored at: " + filePath);
            } catch (Exception e) {
                System.err.println("❌ Error storing profile photo: " + e.getMessage());
                e.printStackTrace();
                // Fallback: store as base64 if file storage fails
                System.out.println("🔄 Falling back to base64 storage");
                profile.setProfilePhoto(updatedProfileDTO.getProfilePhoto());
            }
        } else if (updatedProfileDTO.getProfilePhoto() != null && !updatedProfileDTO.getProfilePhoto().isEmpty()) {
            // Regular URL or existing file path
            profile.setProfilePhoto(updatedProfileDTO.getProfilePhoto());
            System.out.println("✅ Using existing profile photo path: " + updatedProfileDTO.getProfilePhoto());
        } else {
            System.out.println("ℹ️ No profile photo in request - keeping existing: " +
                    (profile.getProfilePhoto() != null ? profile.getProfilePhoto() : "NO PHOTO"));
        }

        Profile updatedProfile = profileRepository.save(profile);

        System.out.println("✅ Profile saved to database successfully");
        System.out.println("📷 Profile photo after save: " + (updatedProfile.getProfilePhoto() != null ? updatedProfile.getProfilePhoto() : "NULL/EMPTY"));

        return convertToDTO(updatedProfile);
    }

    // ✅ NEW: Delete physical profile photo file
    private void deleteProfilePhotoFile(String profilePhotoPath) throws IOException {
        if (profilePhotoPath != null && profilePhotoPath.startsWith("/uploads/")) {
            try {
                String fileName = profilePhotoPath.substring("/uploads/".length());
                Path filePath = Paths.get("uploads").toAbsolutePath().normalize().resolve(fileName);

                if (Files.exists(filePath)) {
                    Files.delete(filePath);
                    System.out.println("🗑️ Deleted physical file: " + filePath);
                } else {
                    System.out.println("⚠️ File not found, skipping deletion: " + filePath);
                }
            } catch (Exception e) {
                System.err.println("❌ Error deleting physical file: " + e.getMessage());
                throw e;
            }
        }
    }

    // ✅ Update Profile Photo Only
    public ProfileDTO updateProfilePhotoByEmail(String email, String profilePhotoUrl) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        Profile profile = user.getProfile();
        if (profile == null) {
            profile = createDefaultProfile(user);
        }

        System.out.println("🔄 Updating profile photo for user: " + email);

        if (profilePhotoUrl != null && profilePhotoUrl.startsWith("data:image")) {
            try {
                String filePath = storeBase64Image(profilePhotoUrl, user.getId());
                profile.setProfilePhoto(filePath);
                System.out.println("✅ Profile photo stored at: " + filePath);
            } catch (Exception e) {
                System.err.println("❌ Error storing profile photo: " + e.getMessage());
                profile.setProfilePhoto(profilePhotoUrl);
            }
        } else {
            profile.setProfilePhoto(profilePhotoUrl);
        }

        Profile savedProfile = profileRepository.save(profile);
        return convertToDTO(savedProfile);
    }

    // ✅ File Storage Method
    private String storeBase64Image(String base64Data, Long userId) throws IOException {
        try {
            // Create uploads directory if it doesn't exist
            Path uploadsDir = Paths.get("uploads").toAbsolutePath().normalize();
            System.out.println("📁 Uploads directory: " + uploadsDir.toString());

            if (!Files.exists(uploadsDir)) {
                Files.createDirectories(uploadsDir);
                System.out.println("✅ Created uploads directory");
            }

            // Generate unique filename
            String fileName = "profile_" + userId + "_" + UUID.randomUUID() + ".jpg";

            // Remove data URL prefix if present
            String base64Image = base64Data;
            if (base64Data.contains(",")) {
                base64Image = base64Data.split(",")[1];
            }

            System.out.println("📸 Decoding base64 image, length: " + base64Image.length());
            byte[] imageBytes = java.util.Base64.getDecoder().decode(base64Image);
            System.out.println("📸 Image bytes decoded: " + imageBytes.length + " bytes");

            Path targetLocation = uploadsDir.resolve(fileName);
            Files.write(targetLocation, imageBytes);

            String filePath = "/uploads/" + fileName;
            System.out.println("✅ File saved successfully: " + filePath);
            return filePath;

        } catch (Exception e) {
            System.err.println("❌ File storage error: " + e.getMessage());
            throw e;
        }
    }

    // ✅ Create Default Profile
    private Profile createDefaultProfile(User user) {
        Profile profile = new Profile();
        profile.setUser(user);
        profile.setEmail(user.getEmail());
        profile.setFirstName("First Name");
        profile.setLastName("Last Name");
        profile.setPhone("");
        profile.setAbout("");
        profile.setBatch("");
        profile.setProfilePhoto("");

        // --- Initialize academic/professional ---
        profile.setGraduationYear("");
        profile.setDegree("");
        profile.setBranch("");
        profile.setCurrentCompany("");
        profile.setPosition("");

        Profile savedProfile = profileRepository.save(profile);
        user.setProfile(savedProfile);
        userRepository.save(user);
        return savedProfile;
    }

    // ✅ Convert Entity → DTO
    private ProfileDTO convertToDTO(Profile profile) {
        ProfileDTO dto = new ProfileDTO();
        dto.setId(profile.getId());
        dto.setFirstName(profile.getFirstName());
        dto.setLastName(profile.getLastName());
        dto.setEmail(profile.getEmail());
        dto.setPhone(profile.getPhone());
        dto.setBatch(profile.getBatch());
        dto.setAbout(profile.getAbout());
        dto.setProfilePhoto(profile.getProfilePhoto());

        dto.setGraduationYear(profile.getGraduationYear());
        dto.setDegree(profile.getDegree());
        dto.setBranch(profile.getBranch());
        dto.setCurrentCompany(profile.getCurrentCompany());
        dto.setPosition(profile.getPosition());

        System.out.println("🔄 Converted to DTO - Profile Photo: " + (dto.getProfilePhoto() != null ? dto.getProfilePhoto() : "NULL/EMPTY"));
        return dto;
    }

    // ✅ Optional: Profile photo upload with MultipartFile
    public ProfileDTO updateProfilePhoto(String email, MultipartFile file) {
        try {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));

            Profile profile = user.getProfile();
            if (profile == null) {
                profile = createDefaultProfile(user);
            }

            // Generate unique filename
            String fileName = "profile_" + user.getId() + "_" + UUID.randomUUID() +
                    getFileExtension(file.getOriginalFilename());

            // Create uploads directory if it doesn't exist
            Path uploadsDir = Paths.get("uploads").toAbsolutePath().normalize();
            if (!Files.exists(uploadsDir)) {
                Files.createDirectories(uploadsDir);
            }

            Path targetLocation = uploadsDir.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation);

            String filePath = "/uploads/" + fileName;
            profile.setProfilePhoto(filePath);

            Profile updated = profileRepository.save(profile);
            return convertToDTO(updated);
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + file.getOriginalFilename(), ex);
        }
    }

    private String getFileExtension(String fileName) {
        if (fileName == null) return ".jpg";
        int lastIndex = fileName.lastIndexOf(".");
        if (lastIndex == -1) return ".jpg";
        return fileName.substring(lastIndex);
    }
}