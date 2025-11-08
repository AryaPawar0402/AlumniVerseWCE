package com.alumniportal.alumni.repository;

import com.alumniportal.alumni.entity.Job;
import com.alumniportal.alumni.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByPostedBy(User postedBy);
}
