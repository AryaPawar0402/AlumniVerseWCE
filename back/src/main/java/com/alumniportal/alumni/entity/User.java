package com.alumniportal.alumni.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"}) // ADD THIS
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    @JsonIgnoreProperties("users") // ADD THIS
    private Role role;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("user") // ADD THIS
    private Profile profile;

    // ✅ Add this helper method
    public String getName() {
        if (profile != null) {
            String first = profile.getFirstName() != null ? profile.getFirstName() : "";
            String last = profile.getLastName() != null ? profile.getLastName() : "";
            return (first + " " + last).trim();
        }
        return email; // fallback if no profile yet
    }
}