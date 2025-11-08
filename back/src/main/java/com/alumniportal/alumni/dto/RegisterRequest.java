package com.alumniportal.alumni.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "First name is required")
    private String firstName;

    private String lastName;

    private String phone;

    private String role;

    @NotBlank(message = "Captcha token is required")
    private String captcha; // new field for reCAPTCHA
}
