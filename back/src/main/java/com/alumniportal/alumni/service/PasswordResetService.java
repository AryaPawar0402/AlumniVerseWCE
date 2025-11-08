package com.alumniportal.alumni.service;

import com.alumniportal.alumni.entity.User;
import com.alumniportal.alumni.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordResetService(UserRepository userRepository,
                                PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Direct password reset without email/token
    public void resetPasswordDirect(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account found with this email address."));

        // Validate new password
        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters long.");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        System.out.println("✅ Password reset successfully for user: " + user.getEmail());
    }

    // Verify if user exists
    public boolean verifyUserExists(String email) {
        return userRepository.findByEmail(email).isPresent();
    }
}