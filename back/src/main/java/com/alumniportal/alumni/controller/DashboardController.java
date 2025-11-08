package com.alumniportal.alumni.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @GetMapping("/stats")
    public ResponseEntity<?> stats(Authentication authentication) {
        // TODO: replace with real service-backed numbers
        return ResponseEntity.ok(Map.of(
                "connections", 0,
                "jobsPosted", 0,
                "events", 0
        ));
    }
}
