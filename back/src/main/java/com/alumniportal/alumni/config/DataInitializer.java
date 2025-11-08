package com.alumniportal.alumni.config;

import com.alumniportal.alumni.entity.Profile;
import com.alumniportal.alumni.entity.Role;
import com.alumniportal.alumni.entity.User;
import com.alumniportal.alumni.repository.ProfileRepository;
import com.alumniportal.alumni.repository.RoleRepository;
import com.alumniportal.alumni.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(RoleRepository roleRepository,
                           UserRepository userRepository,
                           ProfileRepository profileRepository,
                           PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Create default roles if they don't exist
        createRoleIfNotFound("STUDENT");
        createRoleIfNotFound("ALUMNI");
        createRoleIfNotFound("ADMIN");

        // Create fixed admin user
        createAdminIfNotFound();
    }

    private void createRoleIfNotFound(String name) {
        if (roleRepository.findByName(name).isEmpty()) {
            Role role = new Role();
            role.setName(name);
            roleRepository.save(role);
            System.out.println("✅ Created role: " + name);
        } else {
            System.out.println("✅ Role already exists: " + name);
        }
    }

    private void createAdminIfNotFound() {
        String adminEmail = "admin@wce.ac.in"; // Fixed admin email
        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            Role adminRole = roleRepository.findByName("ADMIN")
                    .orElseThrow(() -> new RuntimeException("ADMIN role not found"));

            // Create admin user
            User adminUser = new User();
            adminUser.setEmail(adminEmail);
            adminUser.setPassword(passwordEncoder.encode("admin123")); // Fixed password
            adminUser.setRole(adminRole);

            User savedAdmin = userRepository.save(adminUser);

            // Create admin profile
            Profile adminProfile = new Profile();
            adminProfile.setUser(savedAdmin);
            adminProfile.setFirstName("WCE");
            adminProfile.setLastName("Admin");
            adminProfile.setEmail(adminEmail);
            adminProfile.setPhone("+91-1234567890");
            profileRepository.save(adminProfile);

            savedAdmin.setProfile(adminProfile);
            userRepository.save(savedAdmin);

            System.out.println("✅ Fixed admin user created: " + adminEmail);
        } else {
            System.out.println("✅ Admin user already exists: " + adminEmail);
        }
    }
}