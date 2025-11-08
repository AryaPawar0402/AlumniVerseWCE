package com.alumniportal.alumni.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;

@Component
@Slf4j
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    @Value("${jwt.secret:your-secret-key-here}")
    private String jwtSecret;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authToken = accessor.getFirstNativeHeader("Authorization");

            log.info("🔐 WebSocket CONNECT - Authorization header: {}", authToken != null ? "present" : "missing");

            if (authToken != null && authToken.startsWith("Bearer ")) {
                String token = authToken.substring(7);

                try {
                    Claims claims = Jwts.parser()
                            .setSigningKey(jwtSecret)
                            .parseClaimsJws(token)
                            .getBody();

                    String userId = claims.getSubject();
                    log.info("✅ JWT Valid - User ID: {}", userId);

                    // Create authentication with userId as principal
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(userId, null, new ArrayList<>());

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    accessor.setUser(authentication);

                    log.info("✅ WebSocket authentication successful for user: {}", userId);

                } catch (Exception e) {
                    log.error("❌ JWT validation failed: {}", e.getMessage());
                }
            } else {
                log.warn("⚠️ No valid Authorization header found");
            }
        }

        return message;
    }
}
