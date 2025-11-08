package com.alumniportal.alumni.service;

import com.alumniportal.alumni.entity.Connection;
import com.alumniportal.alumni.entity.User;
import com.alumniportal.alumni.repository.ConnectionRepository;
import com.alumniportal.alumni.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ConnectionService {

    @Autowired
    private ConnectionRepository connectionRepository;

    @Autowired
    private UserRepository userRepository;

    // --------------------- MAIN LOGIC ---------------------

    public void sendConnectionRequest(Long studentId, Long alumniId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        User alumni = userRepository.findById(alumniId)
                .orElseThrow(() -> new RuntimeException("Alumni not found"));

        if (connectionRepository.existsByStudentAndAlumni(student, alumni)) {
            throw new RuntimeException("Connection request already exists");
        }

        Connection connection = Connection.builder()
                .student(student)
                .alumni(alumni)
                .status(Connection.ConnectionStatus.PENDING)
                .build();

        connectionRepository.save(connection);
    }

    // Alumni pending requests DTO
    public List<ConnectionPendingDTO> getPendingRequestsDTO(Long alumniId) {
        List<Connection> pendingList = connectionRepository.findPendingRequestsForAlumniWithStudentDetails(alumniId);
        if (pendingList == null) return Collections.emptyList();

        return pendingList.stream().map(c -> {
            User student = c.getStudent();

            if (student == null) return null;

            var profile = student.getProfile();
            String firstName = profile != null ? profile.getFirstName() : "";
            String lastName = profile != null ? profile.getLastName() : "";
            String profilePhoto = profile != null ? profile.getProfilePhoto() : null;
            String about = profile != null ? profile.getAbout() : "";
            String branch = profile != null ? profile.getBranch() : "";
            String batch = profile != null ? profile.getBatch() : "";
            String degree = profile != null ? profile.getDegree() : "";
            String graduationYear = profile != null ? profile.getGraduationYear() : "";
            String currentCompany = profile != null ? profile.getCurrentCompany() : "";
            String position = profile != null ? profile.getPosition() : "";
            String phone = profile != null ? profile.getPhone() : "";

            StudentDTO dto = new StudentDTO(
                    student.getId(), student.getEmail(), firstName, lastName, profilePhoto, about,
                    branch, batch, degree, graduationYear, currentCompany, position, phone
            );

            return new ConnectionPendingDTO(c.getId(), dto, c.getStatus().name());
        }).filter(Objects::nonNull).collect(Collectors.toList());
    }

    // NEW: Alumni connections DTO - FIXED VERSION
    public List<ConnectionPendingDTO> getAlumniConnectionsDTO(Long alumniId) {
        User alumni = userRepository.findById(alumniId)
                .orElseThrow(() -> new RuntimeException("Alumni not found"));

        List<Connection> connections = connectionRepository.findAcceptedConnectionsByUser(alumni);
        if (connections == null) return Collections.emptyList();

        return connections.stream().map(connection -> {
            User student = connection.getStudent();

            if (student == null) return null;

            // Load the student's profile
            var profile = student.getProfile();
            String firstName = profile != null ? profile.getFirstName() : "";
            String lastName = profile != null ? profile.getLastName() : "";
            String profilePhoto = profile != null ? profile.getProfilePhoto() : null;
            String about = profile != null ? profile.getAbout() : "";
            String branch = profile != null ? profile.getBranch() : "";
            String batch = profile != null ? profile.getBatch() : "";
            String degree = profile != null ? profile.getDegree() : "";
            String graduationYear = profile != null ? profile.getGraduationYear() : "";
            String currentCompany = profile != null ? profile.getCurrentCompany() : "";
            String position = profile != null ? profile.getPosition() : "";
            String phone = profile != null ? profile.getPhone() : "";

            StudentDTO studentDTO = new StudentDTO(
                    student.getId(), student.getEmail(), firstName, lastName, profilePhoto, about,
                    branch, batch, degree, graduationYear, currentCompany, position, phone
            );

            return new ConnectionPendingDTO(connection.getId(), studentDTO, connection.getStatus().name());
        }).filter(Objects::nonNull).collect(Collectors.toList());
    }

    // UPDATED: Accept connection using SimpleConnectionDTO to avoid serialization issues
    public SimpleConnectionDTO acceptConnection(Long connectionId) {
        try {
            Connection conn = connectionRepository.findById(connectionId)
                    .orElseThrow(() -> new RuntimeException("Connection not found with id: " + connectionId));

            System.out.println("Accepting connection: " + connectionId + ", current status: " + conn.getStatus());

            conn.setStatus(Connection.ConnectionStatus.ACCEPTED);
            Connection savedConnection = connectionRepository.save(conn);

            System.out.println("Connection accepted successfully: " + savedConnection.getId());

            // Return simple DTO without circular references
            return new SimpleConnectionDTO(
                    savedConnection.getId(),
                    savedConnection.getStatus().name(),
                    savedConnection.getStudent().getId(),
                    savedConnection.getAlumni().getId()
            );

        } catch (Exception e) {
            System.err.println("Error in acceptConnection: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to accept connection: " + e.getMessage());
        }
    }

    public void rejectConnection(Long connectionId) {
        Connection conn = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new RuntimeException("Connection not found"));
        conn.setStatus(Connection.ConnectionStatus.REJECTED);
        connectionRepository.save(conn);
    }

    public List<Connection> getStudentConnections(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        return connectionRepository.findByStudentAndStatus(student, Connection.ConnectionStatus.ACCEPTED);
    }

    // OLD VERSION - Keep for backward compatibility if needed
    public List<Connection> getAlumniConnections(Long alumniId) {
        User alumni = userRepository.findById(alumniId)
                .orElseThrow(() -> new RuntimeException("Alumni not found"));

        List<Connection> connections = connectionRepository.findAcceptedConnectionsByUser(alumni);

        // Eagerly fetch student and alumni profiles to avoid LazyLoading issues
        return connections.stream().map(connection -> {
            // Initialize lazy-loaded relationships
            if (connection.getStudent() != null) {
                connection.getStudent().getProfile(); // Trigger lazy loading
            }
            if (connection.getAlumni() != null) {
                connection.getAlumni().getProfile(); // Trigger lazy loading
            }
            return connection;
        }).collect(Collectors.toList());
    }

    public List<User> getAllAlumni() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && "ALUMNI".equalsIgnoreCase(u.getRole().getName()))
                .collect(Collectors.toList());
    }

    public List<User> getSuggestedAlumni(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<User> allAlumni = userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && "ALUMNI".equalsIgnoreCase(u.getRole().getName()))
                .collect(Collectors.toList());

        List<Connection> existing = connectionRepository.findByStudent(student);
        Set<Long> excluded = existing.stream()
                .map(c -> c.getAlumni().getId())
                .collect(Collectors.toSet());

        return allAlumni.stream()
                .filter(a -> !excluded.contains(a.getId()))
                .collect(Collectors.toList());
    }

    public List<ConnectionStatusDTO> getConnectionStatus(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        return connectionRepository.findByStudent(student).stream()
                .map(c -> new ConnectionStatusDTO(c.getAlumni().getId(), c.getStatus().name()))
                .collect(Collectors.toList());
    }

    // NEW: Get student profile by ID
    public StudentDTO getStudentProfileDTO(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        var profile = student.getProfile();
        String firstName = profile != null ? profile.getFirstName() : "";
        String lastName = profile != null ? profile.getLastName() : "";
        String profilePhoto = profile != null ? profile.getProfilePhoto() : null;
        String about = profile != null ? profile.getAbout() : "";
        String branch = profile != null ? profile.getBranch() : "";
        String batch = profile != null ? profile.getBatch() : "";
        String degree = profile != null ? profile.getDegree() : "";
        String graduationYear = profile != null ? profile.getGraduationYear() : "";
        String currentCompany = profile != null ? profile.getCurrentCompany() : "";
        String position = profile != null ? profile.getPosition() : "";
        String phone = profile != null ? profile.getPhone() : "";

        return new StudentDTO(
                student.getId(),
                student.getEmail(),
                firstName,
                lastName,
                profilePhoto,
                about,
                branch,
                batch,
                degree,
                graduationYear,
                currentCompany,
                position,
                phone
        );
    }

    // NEW: Get alumni profile by ID - UPDATED to work with current Profile entity
    public AlumniDTO getAlumniProfileDTO(Long alumniId) {
        User alumni = userRepository.findById(alumniId)
                .orElseThrow(() -> new RuntimeException("Alumni not found"));

        var profile = alumni.getProfile();
        String firstName = profile != null ? profile.getFirstName() : "";
        String lastName = profile != null ? profile.getLastName() : "";
        String profilePhoto = profile != null ? profile.getProfilePhoto() : null;
        String about = profile != null ? profile.getAbout() : "";
        String branch = profile != null ? profile.getBranch() : "";
        String batch = profile != null ? profile.getBatch() : "";
        String degree = profile != null ? profile.getDegree() : "";
        String graduationYear = profile != null ? profile.getGraduationYear() : "";
        String currentCompany = profile != null ? profile.getCurrentCompany() : "";
        String position = profile != null ? profile.getPosition() : "";
        String phone = profile != null ? profile.getPhone() : "";

        // These fields don't exist in current Profile entity, so set them as empty
        String industry = "";
        String experience = "";
        String skills = "";

        return new AlumniDTO(
                alumni.getId(),
                alumni.getEmail(),
                firstName,
                lastName,
                profilePhoto,
                about,
                branch,
                batch,
                degree,
                graduationYear,
                currentCompany,
                position,
                phone,
                industry,
                experience,
                skills
        );
    }

    // Helper method for debug endpoint
    public Connection getConnectionById(Long connectionId) {
        return connectionRepository.findById(connectionId).orElse(null);
    }

    // --------------------- DTO CLASSES ---------------------

    // NEW: Simple Connection DTO to avoid serialization issues
    public static class SimpleConnectionDTO {
        private Long id;
        private String status;
        private Long studentId;
        private Long alumniId;

        public SimpleConnectionDTO(Long id, String status, Long studentId, Long alumniId) {
            this.id = id;
            this.status = status;
            this.studentId = studentId;
            this.alumniId = alumniId;
        }

        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Long getStudentId() { return studentId; }
        public void setStudentId(Long studentId) { this.studentId = studentId; }
        public Long getAlumniId() { return alumniId; }
        public void setAlumniId(Long alumniId) { this.alumniId = alumniId; }
    }

    public static class ConnectionPendingDTO {
        private Long id;
        private StudentDTO student;
        private String status;

        public ConnectionPendingDTO(Long id, StudentDTO student, String status) {
            this.id = id;
            this.student = student;
            this.status = status;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public StudentDTO getStudent() { return student; }
        public void setStudent(StudentDTO student) { this.student = student; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class StudentDTO {
        private Long id;
        private String email;
        private String firstName;
        private String lastName;
        private String profilePhoto;
        private String about;
        private String branch;
        private String batch;
        private String degree;
        private String graduationYear;
        private String currentCompany;
        private String position;
        private String phone;

        public StudentDTO(Long id, String email, String firstName, String lastName,
                          String profilePhoto, String about, String branch, String batch,
                          String degree, String graduationYear, String currentCompany,
                          String position, String phone) {
            this.id = id;
            this.email = email;
            this.firstName = firstName;
            this.lastName = lastName;
            this.profilePhoto = profilePhoto;
            this.about = about;
            this.branch = branch;
            this.batch = batch;
            this.degree = degree;
            this.graduationYear = graduationYear;
            this.currentCompany = currentCompany;
            this.position = position;
            this.phone = phone;
        }

        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        public String getProfilePhoto() { return profilePhoto; }
        public void setProfilePhoto(String profilePhoto) { this.profilePhoto = profilePhoto; }
        public String getAbout() { return about; }
        public void setAbout(String about) { this.about = about; }
        public String getBranch() { return branch; }
        public void setBranch(String branch) { this.branch = branch; }
        public String getBatch() { return batch; }
        public void setBatch(String batch) { this.batch = batch; }
        public String getDegree() { return degree; }
        public void setDegree(String degree) { this.degree = degree; }
        public String getGraduationYear() { return graduationYear; }
        public void setGraduationYear(String graduationYear) { this.graduationYear = graduationYear; }
        public String getCurrentCompany() { return currentCompany; }
        public void setCurrentCompany(String currentCompany) { this.currentCompany = currentCompany; }
        public String getPosition() { return position; }
        public void setPosition(String position) { this.position = position; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
    }

    public static class AlumniDTO {
        private Long id;
        private String email;
        private String firstName;
        private String lastName;
        private String profilePhoto;
        private String about;
        private String branch;
        private String batch;
        private String degree;
        private String graduationYear;
        private String currentCompany;
        private String position;
        private String phone;
        private String industry;
        private String experience;
        private String skills;

        public AlumniDTO(Long id, String email, String firstName, String lastName,
                         String profilePhoto, String about, String branch, String batch,
                         String degree, String graduationYear, String currentCompany,
                         String position, String phone, String industry, String experience, String skills) {
            this.id = id;
            this.email = email;
            this.firstName = firstName;
            this.lastName = lastName;
            this.profilePhoto = profilePhoto;
            this.about = about;
            this.branch = branch;
            this.batch = batch;
            this.degree = degree;
            this.graduationYear = graduationYear;
            this.currentCompany = currentCompany;
            this.position = position;
            this.phone = phone;
            this.industry = industry;
            this.experience = experience;
            this.skills = skills;
        }

        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        public String getProfilePhoto() { return profilePhoto; }
        public void setProfilePhoto(String profilePhoto) { this.profilePhoto = profilePhoto; }
        public String getAbout() { return about; }
        public void setAbout(String about) { this.about = about; }
        public String getBranch() { return branch; }
        public void setBranch(String branch) { this.branch = branch; }
        public String getBatch() { return batch; }
        public void setBatch(String batch) { this.batch = batch; }
        public String getDegree() { return degree; }
        public void setDegree(String degree) { this.degree = degree; }
        public String getGraduationYear() { return graduationYear; }
        public void setGraduationYear(String graduationYear) { this.graduationYear = graduationYear; }
        public String getCurrentCompany() { return currentCompany; }
        public void setCurrentCompany(String currentCompany) { this.currentCompany = currentCompany; }
        public String getPosition() { return position; }
        public void setPosition(String position) { this.position = position; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getIndustry() { return industry; }
        public void setIndustry(String industry) { this.industry = industry; }
        public String getExperience() { return experience; }
        public void setExperience(String experience) { this.experience = experience; }
        public String getSkills() { return skills; }
        public void setSkills(String skills) { this.skills = skills; }
    }

    public static class ConnectionStatusDTO {
        private Long alumniId;
        private String status;

        public ConnectionStatusDTO(Long alumniId, String status) {
            this.alumniId = alumniId;
            this.status = status;
        }

        public Long getAlumniId() { return alumniId; }
        public void setAlumniId(Long alumniId) { this.alumniId = alumniId; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}