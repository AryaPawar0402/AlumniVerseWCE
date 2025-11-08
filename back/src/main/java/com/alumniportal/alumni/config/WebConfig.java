package com.alumniportal.alumni.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Get absolute path to project root
        String currentDir = System.getProperty("user.dir");
        Path uploadsDir = Paths.get("uploads").toAbsolutePath().normalize();

        System.out.println("🔧 Configuring static file serving...");
        System.out.println("📁 Current directory: " + currentDir);
        System.out.println("📁 Uploads absolute path: " + uploadsDir);

        // Serve static files from uploads directory
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadsDir + "/")
                .setCachePeriod(3600);

        System.out.println("✅ Static file serving configured:");
        System.out.println("   - /uploads/** → file:" + uploadsDir + "/");

        // Test if directory exists
        if (java.nio.file.Files.exists(uploadsDir)) {
            System.out.println("✅ Uploads directory exists: " + uploadsDir);
        } else {
            System.out.println("❌ Uploads directory NOT found: " + uploadsDir);
        }
    }
}