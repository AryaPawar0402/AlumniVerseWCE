package com.alumniportal.alumni.repository;

import com.alumniportal.alumni.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    // Custom queries can be added here if needed
}
