package com.alumniportal.alumni.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "connections")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Connection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The student who sends the connection request
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    @JsonIgnoreProperties({"connections", "profile", "password"})
    private User student;

    // The alumni who receives the connection request
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alumni_id")
    @JsonIgnoreProperties({"connections", "profile", "password"})
    private User alumni;

    // Status of connection
    @Enumerated(EnumType.STRING)
    private ConnectionStatus status;

    public enum ConnectionStatus {
        PENDING,
        ACCEPTED,
        REJECTED
    }

    // Optional helper method to check if this connection is between two users
    public boolean involves(User user1, User user2) {
        return (student.equals(user1) && alumni.equals(user2))
                || (student.equals(user2) && alumni.equals(user1));
    }
}