package com.alumniportal.alumni.service;

import com.alumniportal.alumni.entity.User;
import com.alumniportal.alumni.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        System.out.println("🔍 CustomUserDetailsService loading user: " + username);

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> {
                    System.out.println("❌ User not found: " + username);
                    return new UsernameNotFoundException("User not found: " + username);
                });

        System.out.println("✅ User found: " + user.getEmail() + " with role: " + user.getRole().getName());

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                getAuthorities(user)
        );
    }

    private Collection<? extends GrantedAuthority> getAuthorities(User user) {
        String roleName = user.getRole().getName();
        System.out.println("✅ Creating authority for role: " + roleName);

        // Ensure role has ROLE_ prefix
        String authority = roleName.startsWith("ROLE_") ? roleName : "ROLE_" + roleName;
        System.out.println("✅ Final authority: " + authority);

        return Collections.singletonList(new SimpleGrantedAuthority(authority));
    }
}