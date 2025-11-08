package com.alumniportal.alumni.controller;

import com.alumniportal.alumni.entity.Event;
import com.alumniportal.alumni.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class EventController {

    @Autowired
    private EventService eventService;

    // ===================== ADMIN =====================

    // Test endpoint to verify admin route works
    @PostMapping("/admin/events/test")
    public ResponseEntity<String> testAdminEndpoint(@RequestParam("message") String message) {
        System.out.println("🎯 === ADMIN TEST ENDPOINT HIT ===");
        System.out.println("📥 Received message: " + message);
        return ResponseEntity.ok("Admin endpoint working! Received: " + message);
    }

    // Create event with file upload - BASE64 ONLY APPROACH
    @PostMapping("/admin/events")
    public ResponseEntity<?> addEvent(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("date") String date,
            @RequestParam("organizer") String organizer,
            @RequestParam(value = "registrationLink", required = false) String registrationLink,
            @RequestParam(value = "image", required = false) MultipartFile imageFile) {

        try {
            System.out.println("🎯 === EVENT CREATION STARTED ===");
            System.out.println("📥 Received event creation request:");
            System.out.println("   Title: " + title);
            System.out.println("   Description: " + description);
            System.out.println("   Date: " + date);
            System.out.println("   Organizer: " + organizer);
            System.out.println("   Registration Link: " + registrationLink);

            if (imageFile != null && !imageFile.isEmpty()) {
                System.out.println("   Image File: " + imageFile.getOriginalFilename() +
                        " (" + imageFile.getSize() + " bytes, " + imageFile.getContentType() + ")");
            } else {
                System.out.println("   Image File: NULL or EMPTY");
            }

            // Validate required fields
            if (title == null || title.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Title is required");
            }
            if (description == null || description.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Description is required");
            }
            if (date == null || date.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Date is required");
            }
            if (organizer == null || organizer.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Organizer is required");
            }

            // Parse date
            LocalDate eventDate;
            try {
                eventDate = LocalDate.parse(date);
                System.out.println("📅 Parsed date: " + eventDate);
            } catch (Exception e) {
                System.err.println("❌ Date parsing error: " + e.getMessage());
                return ResponseEntity.badRequest().body("Invalid date format. Use YYYY-MM-DD");
            }

            // Handle image upload - BASE64 ONLY (NO FILE STORAGE)
            String imageUrl = null;
            if (imageFile != null && !imageFile.isEmpty()) {
                try {
                    imageUrl = convertImageToBase64(imageFile);
                    if (imageUrl != null) {
                        System.out.println("🖼️ Image converted to Base64 successfully");
                        System.out.println("   Base64 data length: " + imageUrl.length());
                    } else {
                        System.err.println("❌ Failed to convert image to Base64");
                    }
                } catch (Exception e) {
                    System.err.println("❌ Image processing error: " + e.getMessage());
                    // Continue without image - don't fail the entire request
                }
            }

            // Create and save event - USING SETTERS APPROACH
            Event event = new Event();
            event.setTitle(title);
            event.setDescription(description);
            event.setDate(eventDate);
            event.setOrganizer(organizer);
            event.setImageUrl(imageUrl);
            event.setRegistrationLink(registrationLink); // ADDED THIS LINE

            System.out.println("💾 Saving event to database...");

            Event savedEvent = eventService.saveEvent(event);

            System.out.println("✅ EVENT SAVED SUCCESSFULLY!");
            System.out.println("   ID: " + savedEvent.getId());
            System.out.println("   Title: " + savedEvent.getTitle());
            System.out.println("   Has Image: " + (savedEvent.getImageUrl() != null ? "Yes (Base64)" : "No"));
            System.out.println("   Registration Link: " + savedEvent.getRegistrationLink());
            System.out.println("🎯 === EVENT CREATION COMPLETED ===");

            return ResponseEntity.ok(savedEvent);

        } catch (Exception e) {
            System.err.println("❌ CRITICAL ERROR in event creation:");
            System.err.println("   Error: " + e.getMessage());
            System.err.println("   Exception: " + e.getClass().getName());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Server error: " + e.getMessage());
        }
    }

    // Method to convert image to Base64 (NO FILE STORAGE)
    private String convertImageToBase64(MultipartFile imageFile) {
        try {
            // Convert image to Base64
            byte[] imageBytes = imageFile.getBytes();
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);
            String imageType = imageFile.getContentType();

            // Create data URL
            String imageUrl = "data:" + imageType + ";base64," + base64Image;

            System.out.println("💾 Image converted to Base64:");
            System.out.println("   Type: " + imageType);
            System.out.println("   Base64 length: " + base64Image.length() + " characters");

            return imageUrl;

        } catch (Exception e) {
            System.err.println("❌ Error converting image to Base64: " + e.getMessage());
            return null;
        }
    }

    // Delete an event by ID
    @DeleteMapping("/admin/events/{id}")
    public ResponseEntity<String> deleteEvent(@PathVariable Long id) {
        try {
            System.out.println("🗑️ Deleting event with ID: " + id);
            eventService.deleteEvent(id);
            System.out.println("✅ Event deleted successfully");
            return ResponseEntity.ok("Event deleted successfully");
        } catch (Exception e) {
            System.err.println("❌ Error deleting event: " + e.getMessage());
            return ResponseEntity.status(500).body("Error deleting event");
        }
    }

    // ===================== STUDENT =====================

    // Get all events (students can view) - UPDATED WITH FILE TO BASE64 CONVERSION
    @GetMapping("/events")
    public List<Event> getAllEvents() {
        List<Event> events = eventService.getAllEvents();
        System.out.println("📋 === RETURNING EVENTS TO FRONTEND ===");
        System.out.println("   Total events: " + events.size());

        // Convert file paths to Base64 for existing events
        for (Event event : events) {
            if (event.getImageUrl() != null && event.getImageUrl().startsWith("/uploads/")) {
                try {
                    System.out.println("🔄 Attempting to convert file to Base64 for event: " + event.getTitle());
                    String base64Image = convertFileToBase64(event.getImageUrl());
                    if (base64Image != null) {
                        event.setImageUrl(base64Image);
                        System.out.println("   ✅ Successfully converted file to Base64");
                    } else {
                        System.err.println("   ❌ Failed to convert file to Base64, setting to null");
                        event.setImageUrl(null); // Set to null if conversion fails
                    }
                } catch (Exception e) {
                    System.err.println("   ❌ Error converting file to Base64: " + e.getMessage());
                    event.setImageUrl(null); // Set to null on error
                }
            }
        }

        // Log all events with their registration links
        for (Event event : events) {
            boolean hasImage = event.getImageUrl() != null;
            boolean isBase64 = hasImage && event.getImageUrl().startsWith("data:image/");
            boolean hasRegistrationLink = event.getRegistrationLink() != null && !event.getRegistrationLink().trim().isEmpty();

            System.out.println("   📍 Event: '" + event.getTitle() +
                    "' | ID: " + event.getId() +
                    " | Image: " + (hasImage ? "✅ Base64" : "❌ None") +
                    " | Reg Link: " + (hasRegistrationLink ? "✅ " + event.getRegistrationLink() : "❌ None"));
        }

        return events;
    }

    // Method to convert existing files to Base64
    private String convertFileToBase64(String filePath) {
        try {
            System.out.println("   📁 Converting file: " + filePath);

            // Extract filename from path
            String filename = filePath.substring(filePath.lastIndexOf("/") + 1);
            System.out.println("   📄 Filename: " + filename);

            // Try different possible locations
            Path[] possiblePaths = {
                    Paths.get("uploads", "events", filename).toAbsolutePath(),
                    Paths.get("uploads/events", filename).toAbsolutePath(),
                    Paths.get(filename).toAbsolutePath() // In case file is in root
            };

            Path fileLocation = null;
            for (Path path : possiblePaths) {
                if (Files.exists(path)) {
                    fileLocation = path;
                    System.out.println("   ✅ File found at: " + path);
                    break;
                }
            }

            if (fileLocation == null) {
                System.err.println("   ❌ File not found in any location: " + filename);
                // Try one more location - current working directory
                Path currentDirPath = Paths.get(System.getProperty("user.dir"), "uploads", "events", filename);
                if (Files.exists(currentDirPath)) {
                    fileLocation = currentDirPath;
                    System.out.println("   ✅ File found in current dir: " + currentDirPath);
                } else {
                    System.err.println("   ❌ File not found in current dir either: " + currentDirPath);
                    return null;
                }
            }

            // Read file and convert to Base64
            byte[] fileBytes = Files.readAllBytes(fileLocation);
            String base64Image = Base64.getEncoder().encodeToString(fileBytes);

            // Determine MIME type from file extension
            String mimeType = "image/png"; // default
            String lowerPath = filePath.toLowerCase();
            if (lowerPath.endsWith(".jpg") || lowerPath.endsWith(".jpeg")) {
                mimeType = "image/jpeg";
            } else if (lowerPath.endsWith(".png")) {
                mimeType = "image/png";
            } else if (lowerPath.endsWith(".gif")) {
                mimeType = "image/gif";
            }

            String imageUrl = "data:" + mimeType + ";base64," + base64Image;
            System.out.println("   💾 Successfully converted to Base64");
            System.out.println("   📊 File size: " + fileBytes.length + " bytes");
            System.out.println("   🖼️ MIME type: " + mimeType);

            return imageUrl;

        } catch (Exception e) {
            System.err.println("   ❌ Error converting file to Base64: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    // Get single event by ID
    @GetMapping("/events/{id}")
    public Optional<Event> getEventById(@PathVariable Long id) {
        System.out.println("🔍 Fetching single event with ID: " + id);
        Optional<Event> event = eventService.getEventById(id);

        // Convert file path to Base64 if needed
        if (event.isPresent() && event.get().getImageUrl() != null &&
                event.get().getImageUrl().startsWith("/uploads/")) {
            try {
                String base64Image = convertFileToBase64(event.get().getImageUrl());
                if (base64Image != null) {
                    event.get().setImageUrl(base64Image);
                    System.out.println("✅ Converted file to Base64 for single event");
                }
            } catch (Exception e) {
                System.err.println("❌ Failed to convert file to Base64 for single event");
            }
        }

        // Log registration link for single event
        if (event.isPresent()) {
            Event currentEvent = event.get();
            boolean hasRegistrationLink = currentEvent.getRegistrationLink() != null && !currentEvent.getRegistrationLink().trim().isEmpty();
            System.out.println("📍 Single Event: '" + currentEvent.getTitle() +
                    "' | Reg Link: " + (hasRegistrationLink ? "✅ " + currentEvent.getRegistrationLink() : "❌ None"));
        }

        return event;
    }
}