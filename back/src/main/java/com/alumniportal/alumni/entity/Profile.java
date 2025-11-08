package com.alumniportal.alumni.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "profiles")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) // ADD THIS LINE
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    private String email;
    private String phone;
    private String batch;
    private String about;

    @Column(name = "graduation_year")
    private String graduationYear;

    private String degree;
    private String branch;

    @Column(name = "current_company")
    private String currentCompany;

    private String position;

    @Column(name = "profile_photo")
    private String profilePhoto;

    @OneToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore // Keep this, it's good for preventing circular references
    private User user;

    // Default constructor
    public Profile() {}

    // ====== Getters and Setters ======
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getBatch() { return batch; }
    public void setBatch(String batch) { this.batch = batch; }

    public String getAbout() { return about; }
    public void setAbout(String about) { this.about = about; }

    public String getGraduationYear() { return graduationYear; }
    public void setGraduationYear(String graduationYear) { this.graduationYear = graduationYear; }

    public String getDegree() { return degree; }
    public void setDegree(String degree) { this.degree = degree; }

    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }

    public String getCurrentCompany() { return currentCompany; }
    public void setCurrentCompany(String currentCompany) { this.currentCompany = currentCompany; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public String getProfilePhoto() { return profilePhoto; }
    public void setProfilePhoto(String profilePhoto) { this.profilePhoto = profilePhoto; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}