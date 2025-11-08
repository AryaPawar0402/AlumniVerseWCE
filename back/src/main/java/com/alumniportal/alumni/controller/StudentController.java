package com.alumniportal.alumni.controller;

import com.alumniportal.alumni.entity.User;
import com.alumniportal.alumni.service.StudentService;
import com.alumniportal.alumni.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = "http://localhost:3000") // adjust your frontend URL
public class StudentController {

    private final StudentService studentService;
    private final UserRepository userRepository;

    public StudentController(StudentService studentService, UserRepository userRepository) {
        this.studentService = studentService;
        this.userRepository = userRepository;
    }

    // Fetch student profile by ID
    @GetMapping("/profile/{studentId}")
    public ResponseEntity<?> getStudentProfile(@PathVariable Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        return ResponseEntity.ok(studentService.getStudentProfile(student));
    }

    // Fetch all alumni (for LinkedIn-like view)
    @GetMapping("/alumni")
    public ResponseEntity<List<?>> getAllAlumni() {
        List<?> alumniList = studentService.getAllAlumni();
        return ResponseEntity.ok(alumniList);
    }

    // Send connection request to an alumni
    @PostMapping("/connect")
    public ResponseEntity<String> sendConnectionRequest(@RequestParam Long studentId,
                                                        @RequestParam Long alumniId) {

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        User alumni = userRepository.findById(alumniId)
                .orElseThrow(() -> new RuntimeException("Alumni not found"));

        studentService.sendConnectionRequest(student, alumni);
        return ResponseEntity.ok("Connection request sent!");
    }

    // Check if student is connected with an alumni
    @GetMapping("/connection-status")
    public ResponseEntity<String> checkConnection(@RequestParam Long studentId,
                                                  @RequestParam Long alumniId) {

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        User alumni = userRepository.findById(alumniId)
                .orElseThrow(() -> new RuntimeException("Alumni not found"));

        boolean isConnected = studentService.isConnected(student, alumni);
        return ResponseEntity.ok(isConnected ? "Connected" : "Not Connected");
    }

    // Post achievement
    @PostMapping("/achievement")
    public ResponseEntity<String> postAchievement(@RequestParam Long studentId,
                                                  @RequestParam String achievement) {

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        studentService.postAchievement(student, achievement);
        return ResponseEntity.ok("Achievement posted successfully!");
    }
}
