package com.alumniportal.alumni.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 2000)
    private String content;  // Achievement / update

    private String mediaUrl;  // Optional image / file

    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "created_by_id")
    private User createdBy;  // Student who created this post
}
