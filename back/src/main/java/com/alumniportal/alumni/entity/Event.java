package com.alumniportal.alumni.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private LocalDate date;
    private String organizer;

    @Column(columnDefinition = "TEXT") // Important for Base64 data
    private String imageUrl;

    // ADD THIS FIELD - Registration Link
    private String registrationLink;

    public Event() {}

    public Event(String title, String description, LocalDate date, String organizer, String imageUrl, String registrationLink) {
        this.title = title;
        this.description = description;
        this.date = date;
        this.organizer = organizer;
        this.imageUrl = imageUrl;
        this.registrationLink = registrationLink;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getOrganizer() { return organizer; }
    public void setOrganizer(String organizer) { this.organizer = organizer; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    // ADD GETTER AND SETTER FOR REGISTRATION LINK
    public String getRegistrationLink() { return registrationLink; }
    public void setRegistrationLink(String registrationLink) { this.registrationLink = registrationLink; }
}