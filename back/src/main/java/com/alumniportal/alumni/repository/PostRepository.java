package com.alumniportal.alumni.repository;

import com.alumniportal.alumni.entity.Post;
import com.alumniportal.alumni.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    // Fetch posts by a specific student
    List<Post> findByCreatedBy(User user);

    // Fetch posts from multiple users (e.g., all alumni for student feed)
    List<Post> findByCreatedByIn(List<User> users);
}
