package com.alumniportal.alumni.repository;

import com.alumniportal.alumni.entity.Connection;
import com.alumniportal.alumni.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ConnectionRepository extends JpaRepository<Connection, Long> {

    // Find connection between a specific student and alumni
    Optional<Connection> findByStudentAndAlumni(User student, User alumni);

    // Find connections by student and status
    List<Connection> findByStudentAndStatus(User student, Connection.ConnectionStatus status);

    // Find connections by alumni and status
    List<Connection> findByAlumniAndStatus(User alumni, Connection.ConnectionStatus status);

    // Find all connections for a given student (used for status mapping)
    List<Connection> findByStudent(User student);

    // Find accepted connections where the user is either student or alumni - FIXED METHOD
    @Query("SELECT c FROM Connection c WHERE (c.student = :user OR c.alumni = :user) AND c.status = 'ACCEPTED'")
    List<Connection> findAcceptedConnectionsByUser(@Param("user") User user);

    // Find pending requests for a specific alumni
    @Query("SELECT c FROM Connection c WHERE c.alumni.id = :alumniId AND c.status = 'PENDING'")
    List<Connection> findPendingRequestsForAlumni(@Param("alumniId") Long alumniId);

    // Check if connection already exists between student and alumni
    boolean existsByStudentAndAlumni(User student, User alumni);

    // Fixed profile fetching with proper field names
    @Query("SELECT c FROM Connection c JOIN FETCH c.student s JOIN FETCH s.profile p WHERE c.alumni.id = :alumniId AND c.status = 'PENDING'")
    List<Connection> findPendingRequestsForAlumniWithStudentDetails(@Param("alumniId") Long alumniId);
}