package com.alumniportal.alumni.controller;

import com.alumniportal.alumni.dto.AuthRequest;
import com.alumniportal.alumni.dto.AuthResponse;
import com.alumniportal.alumni.dto.RegisterRequest;
import com.alumniportal.alumni.dto.DirectResetPasswordRequest;
import com.alumniportal.alumni.service.AuthService;
import com.alumniportal.alumni.service.CaptchaService;
import com.alumniportal.alumni.service.PasswordResetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final AuthService authService;
    private final CaptchaService captchaService;
    private final PasswordResetService passwordResetService;

    public AuthController(AuthService authService, CaptchaService captchaService, PasswordResetService passwordResetService) {
        this.authService = authService;
        this.captchaService = captchaService;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req, BindingResult result) {
        if (result.hasErrors()) {
            String errorMessage = result.getFieldErrors().stream()
                    .map(error -> error.getField() + ": " + error.getDefaultMessage())
                    .findFirst()
                    .orElse("Validation failed");
            return ResponseEntity.badRequest().body(errorMessage);
        }

        // Debug log: registration attempt
        System.out.println("=== REGISTER ATTEMPT ===");
        System.out.println("Email: " + req.getEmail());
        System.out.println("Role: " + req.getRole());
        System.out.println("Captcha token: " + req.getCaptcha());

        // Verify CAPTCHA
        boolean captchaValid = captchaService.verifyCaptcha(req.getCaptcha());
        System.out.println("Captcha valid? " + captchaValid);
        if (!captchaValid) {
            return ResponseEntity.badRequest().body("Captcha verification failed. Are you a robot?");
        }

        try {
            AuthResponse response = authService.register(req);
            System.out.println("Registration successful for email: " + req.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Registration failed: " + e.getMessage());
            // Return more specific error messages
            String errorMessage = e.getMessage();
            if (errorMessage.contains("Email already registered")) {
                return ResponseEntity.badRequest().body("This email is already registered. Please use a different email or try logging in.");
            } else if (errorMessage.contains("Role not found") || errorMessage.contains("Invalid role")) {
                return ResponseEntity.badRequest().body("Invalid user role selected. Please try again.");
            } else if (errorMessage.contains("Admin registration")) {
                return ResponseEntity.badRequest().body("Admin registration is not allowed through this form.");
            } else {
                return ResponseEntity.badRequest().body("Registration failed: " + errorMessage);
            }
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest req) {
        // Debug log: login attempt
        System.out.println("=== LOGIN ATTEMPT ===");
        System.out.println("Email: " + req.getEmail());
        System.out.println("Captcha token: " + req.getCaptcha());

        // Verify CAPTCHA
        boolean captchaValid = captchaService.verifyCaptcha(req.getCaptcha());
        System.out.println("Captcha valid? " + captchaValid);
        if (!captchaValid) {
            return ResponseEntity.badRequest().body("Captcha verification failed. Are you a robot?");
        }

        try {
            AuthResponse response = authService.login(req);
            System.out.println("Login successful for email: " + req.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Login failed: " + e.getMessage());
            // Return more specific error messages
            String errorMessage = e.getMessage();
            if (errorMessage.contains("User not found")) {
                return ResponseEntity.badRequest().body("No account found with this email. Please check your email or register for a new account.");
            } else if (errorMessage.contains("Invalid credentials")) {
                return ResponseEntity.badRequest().body("Incorrect password. Please try again or reset your password.");
            } else {
                return ResponseEntity.badRequest().body("Login failed: " + errorMessage);
            }
        }
    }

    // Direct Password Reset (without email)
    @PostMapping("/reset-password-direct")
    public ResponseEntity<?> resetPasswordDirect(@Valid @RequestBody DirectResetPasswordRequest request) {
        try {
            passwordResetService.resetPasswordDirect(request.getEmail(), request.getNewPassword());
            return ResponseEntity.ok("Password has been reset successfully. You can now login with your new password.");
        } catch (Exception e) {
            System.out.println("Direct password reset failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Verify user exists for password reset
    @GetMapping("/verify-user")
    public ResponseEntity<?> verifyUser(@RequestParam String email) {
        try {
            boolean userExists = passwordResetService.verifyUserExists(email);
            if (userExists) {
                return ResponseEntity.ok("User exists");
            } else {
                return ResponseEntity.badRequest().body("No account found with this email address.");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error verifying user: " + e.getMessage());
        }
    }
}