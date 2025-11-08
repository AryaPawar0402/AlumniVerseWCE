package com.alumniportal.alumni.controller;

import com.alumniportal.alumni.entity.Connection;
import com.alumniportal.alumni.entity.User;
import com.alumniportal.alumni.service.ConnectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/connections")
@CrossOrigin(origins = "*")
public class ConnectionController {

    @Autowired
    private ConnectionService connectionService;

    // Student sends request
    @PostMapping("/send")
    public Map<String, String> sendRequest(@RequestParam Long studentId, @RequestParam Long alumniId) {
        connectionService.sendConnectionRequest(studentId, alumniId);
        return Map.of("message", "Connection request sent successfully");
    }

    // Alumni fetches pending requests (returns DTOs to avoid serializing full entities)
    @GetMapping("/pending/{alumniId}")
    public List<ConnectionService.ConnectionPendingDTO> getPendingRequests(@PathVariable Long alumniId) {
        return connectionService.getPendingRequestsDTO(alumniId);
    }

    // Alumni accepts a request - UPDATED to use SimpleConnectionDTO
    @PostMapping("/accept/{connectionId}")
    public ConnectionService.SimpleConnectionDTO acceptRequest(@PathVariable Long connectionId) {
        return connectionService.acceptConnection(connectionId);
    }

    // Alumni rejects a request
    @PostMapping("/reject/{connectionId}")
    public Map<String, String> rejectRequest(@PathVariable Long connectionId) {
        connectionService.rejectConnection(connectionId);
        return Map.of("message", "Connection rejected");
    }

    // Student fetches accepted connections
    @GetMapping("/student/{studentId}")
    public List<Connection> getStudentConnections(@PathVariable Long studentId) {
        return connectionService.getStudentConnections(studentId);
    }

    // FIXED: Alumni fetches accepted connections - NOW returns DTOs with complete profile data
    @GetMapping("/alumni/{alumniId}")
    public List<ConnectionService.ConnectionPendingDTO> getAlumniConnections(@PathVariable Long alumniId) {
        return connectionService.getAlumniConnectionsDTO(alumniId);
    }

    // Suggested Alumni list for Student
    @GetMapping("/suggested/{studentId}")
    public List<User> getSuggestedAlumni(@PathVariable Long studentId) {
        return connectionService.getSuggestedAlumni(studentId);
    }

    // Fetch all alumni (used by StudentNetwork.jsx)
    @GetMapping("/allAlumni")
    public List<User> getAllAlumni() {
        return connectionService.getAllAlumni();
    }

    // Return List instead of Map for student connection statuses
    @GetMapping("/status/{studentId}")
    public List<ConnectionService.ConnectionStatusDTO> getConnectionStatus(@PathVariable Long studentId) {
        return connectionService.getConnectionStatus(studentId);
    }

    // NEW: Get student profile by ID
    @GetMapping("/students/{studentId}/profile")
    public ConnectionService.StudentDTO getStudentProfile(@PathVariable Long studentId) {
        return connectionService.getStudentProfileDTO(studentId);
    }

    // NEW: Get alumni profile by ID
    @GetMapping("/alumni/{alumniId}/profile")
    public ConnectionService.AlumniDTO getAlumniProfile(@PathVariable Long alumniId) {
        return connectionService.getAlumniProfileDTO(alumniId);
    }

    // Debug endpoint to test connections
    @GetMapping("/test-accept/{connectionId}")
    public String testAccept(@PathVariable Long connectionId) {
        try {
            Connection conn = connectionService.getConnectionById(connectionId);
            if (conn == null) {
                return "Connection not found";
            }
            return "Connection found: " + conn.getId() + ", Status: " + conn.getStatus() +
                    ", Student: " + conn.getStudent().getId() + ", Alumni: " + conn.getAlumni().getId();
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }
}