package com.alumniportal.alumni.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class CaptchaService {

    // Use your actual secret key here
    private static final String SECRET_KEY = "6LdJxtsrAAAAAJobhn7-E6vawhFdlovPLnj1NltO";
    private static final String VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

    public boolean verifyCaptcha(String token) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = VERIFY_URL + "?secret=" + SECRET_KEY + "&response=" + token;

            // Make POST request to Google
            String response = restTemplate.postForObject(url, null, String.class);

            // Parse JSON safely
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.readTree(response);

            // Optional: log the full response for debugging
            System.out.println("Captcha verification response: " + response);

            // Return success or false if missing
            return jsonNode.path("success").asBoolean(false);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
