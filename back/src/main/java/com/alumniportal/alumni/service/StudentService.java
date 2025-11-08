package com.alumniportal.alumni.service;

import com.alumniportal.alumni.entity.Connection;
import com.alumniportal.alumni.entity.Connection.ConnectionStatus;
import com.alumniportal.alumni.entity.Profile;
import com.alumniportal.alumni.entity.User;
import com.alumniportal.alumni.repository.ConnectionRepository;
import com.alumniportal.alumni.repository.ProfileRepository;
import com.alumniportal.alumni.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StudentService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final ConnectionRepository connectionRepository;

    public StudentService(ProfileRepository profileRepository,
                          UserRepository userRepository,
                          ConnectionRepository connectionRepository) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
        this.connectionRepository = connectionRepository;
    }

    // Fetch student's profile by User
    public Profile getStudentProfile(User student) {
        return profileRepository.findByUser(student)
                .orElseThrow(() -> new RuntimeException("Profile not found for student: " + student.getId()));
    }

    // Fetch all alumni profiles
    public List<Profile> getAllAlumni() {
        List<User> alumniUsers = userRepository.findAll()
                .stream()
                .filter(u -> u.getRole().getName().equalsIgnoreCase("ALUMNI"))
                .collect(Collectors.toList());

        return alumniUsers.stream()
                .map(u -> profileRepository.findByUser(u)
                        .orElseThrow(() -> new RuntimeException("Profile not found for alumni: " + u.getId())))
                .collect(Collectors.toList());
    }

    // Send connection request from student to alumni
    public Connection sendConnectionRequest(User student, User alumni) {
        Optional<Connection> existing = connectionRepository.findByStudentAndAlumni(student, alumni);
        if (existing.isPresent()) {
            throw new RuntimeException("Connection request already exists!");
        }

        Connection request = Connection.builder()
                .student(student)
                .alumni(alumni)
                .status(ConnectionStatus.PENDING)
                .build();

        return connectionRepository.save(request);
    }

    // Check connection status between student and alumni
    public boolean isConnected(User student, User alumni) {
        Optional<Connection> connection = connectionRepository.findByStudentAndAlumni(student, alumni);
        return connection.map(c -> c.getStatus() == ConnectionStatus.ACCEPTED).orElse(false);
    }

    // Placeholder method: post achievement by student
    public void postAchievement(User student, String achievementText) {
        // You can implement saving achievements in a new Achievement entity
        System.out.println("Achievement posted by student " + student.getId() + ": " + achievementText);
    }
}
