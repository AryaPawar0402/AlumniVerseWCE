package com.alumniportal.alumni.repository;

import com.alumniportal.alumni.entity.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AchievementRepository extends JpaRepository<Achievement, Long> {

    List<Achievement> findByStudentIdOrderByCreatedAtDesc(String studentId);

    // ✅ Now works correctly with new studentEmail field
    List<Achievement> findByStudentEmailOrderByCreatedAtDesc(String email);

    // ✅ NEW: Query to find achievements by student ID (supports both string and Long)
    @Query("SELECT a FROM Achievement a WHERE a.studentId = :studentId OR a.studentEmail = :studentId")
    List<Achievement> findByStudentIdOrEmail(@Param("studentId") String studentId);
}