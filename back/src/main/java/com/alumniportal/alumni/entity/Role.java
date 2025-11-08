package com.alumniportal.alumni.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "users"}) // ADD THIS LINE
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // e.g., "ADMIN", "STUDENT", "ALUMNI"

    // Note: If you have a @OneToMany relationship with User, add @JsonIgnore to it
    // @OneToMany(mappedBy = "role")
    // @JsonIgnore
    // private List<User> users;
}