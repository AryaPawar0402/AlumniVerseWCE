package com.alumniportal.alumni.repository;

import com.alumniportal.alumni.entity.Profile;
import com.alumniportal.alumni.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProfileRepository extends JpaRepository<Profile, Long> {
    // Custom finder method
    Optional<Profile> findByUser(User user);

    // Optional: find by userId directly
    Optional<Profile> findByUserId(Long userId);
}
