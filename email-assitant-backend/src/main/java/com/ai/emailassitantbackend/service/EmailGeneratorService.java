package com.ai.emailassitantbackend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestTemplate;

public class EmailGeneratorService {

    private final RestTemplate restTemplate; // Blocking HTTP client
    private final ObjectMapper objectMapper; // ObjectMapper for JSON processing


    @Value("${gemini.api.key}")
    private String geminiAPIKey;
    @Value("${gemini.api.url}")
    private String geminiAPIURL;
    @Value("${gemini.model.path}")
    private String geminiModelPath;


    public EmailGeneratorService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }
}
