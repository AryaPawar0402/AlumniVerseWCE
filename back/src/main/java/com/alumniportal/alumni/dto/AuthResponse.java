package com.alumniportal.alumni.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String message;
    private String email;
    private String role;
    private Long userId; // ✅ ADD THIS FIELD

    // ✅ KEEP existing constructor for backward compatibility
    public AuthResponse(String token, String message, String email, String role) {
        this.token = token;
        this.message = message;
        this.email = email;
        this.role = role;
    }
}