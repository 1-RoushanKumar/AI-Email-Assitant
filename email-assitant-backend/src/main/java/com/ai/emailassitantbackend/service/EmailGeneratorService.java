package com.ai.emailassitantbackend.service;

import com.ai.emailassitantbackend.entity.EmailRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class EmailGeneratorService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;


    @Value("${gemini.api.key}")
    private String geminiAPIKey;
    @Value("${gemini.api.url}")
    private String geminiAPIURL;
    @Value("${gemini.model.path}")
    private String geminiModelPath;


    public EmailGeneratorService(RestTemplateBuilder restTemplateBuilder, ObjectMapper objectMapper) {
        this.restTemplate = restTemplateBuilder.build();
        this.objectMapper = objectMapper;
    }

    public String generateEmailReply(EmailRequest emailRequest) {
        String prompt = buildPrompt(emailRequest);

        String fullApiUrl = geminiAPIURL + geminiModelPath + "?key=" + geminiAPIKey;

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)
                        ))
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        String responseBody = null;
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(fullApiUrl, requestEntity, String.class);
            responseBody = response.getBody();

            return extractResponseContent(responseBody);

        } catch (HttpClientErrorException e) {
            System.err.println("Client error calling Gemini API: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            return "Client error from Gemini API: " + e.getStatusCode() + " - " + e.getStatusText() + " - " + e.getResponseBodyAsString();
        } catch (HttpServerErrorException e) {
            System.err.println("Server error from Gemini API: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            return "Server error from Gemini API: " + e.getStatusCode() + " - " + e.getStatusText() + " - " + e.getResponseBodyAsString();
        } catch (ResourceAccessException e) {
            System.err.println("Network/Resource access error during API call: " + e.getMessage());
            e.printStackTrace();
            return "Network error: " + e.getMessage();
        } catch (Exception e) {
            System.err.println("An unexpected error occurred during API call: " + e.getMessage());
            e.printStackTrace();
            return "An unexpected error occurred: " + e.getMessage();
        }
    }

    private String extractResponseContent(String response) {
        if (response == null || response.isEmpty()) {
            return "No response received from the API.";
        }
        try {
            JsonNode rootNode = objectMapper.readTree(response);
            JsonNode textNode = rootNode.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text");

            if (textNode != null && textNode.isTextual()) {
                return textNode.asText();
            } else {
                return "Could not extract 'text' from Gemini API response. Response structure might be unexpected: " + response;
            }
        } catch (Exception e) {
            System.err.println("Error parsing Gemini API response: " + e.getMessage());
            e.printStackTrace();
            return "Error processing API response: " + e.getMessage();
        }
    }


    private String buildPrompt(EmailRequest emailRequest) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Generate an email reply based on the following content. Do not include a subject line in the response.");

        // Conditionally append tone if provided by the user
        if (emailRequest.getTone() != null && !emailRequest.getTone().isEmpty()) {
            prompt.append(" Use a ").append(emailRequest.getTone()).append(" tone.");
        }
        // Conditionally append desired length if provided
        if (emailRequest.getDesiredLength() != null && !emailRequest.getDesiredLength().isEmpty()) {
            prompt.append(" Make it ").append(emailRequest.getDesiredLength()).append(".");
        }
        // Conditionally append keywords if provided
        if (emailRequest.getKeywords() != null && !emailRequest.getKeywords().isEmpty()) {
            prompt.append(" Include the following keywords: ").append(emailRequest.getKeywords()).append(".");
        }
        // Conditionally append language if provided and not English (as English is default assumption)
        if (emailRequest.getLanguage() != null && !emailRequest.getLanguage().isEmpty() && !emailRequest.getLanguage().equalsIgnoreCase("English")) {
            prompt.append(" Write the reply in ").append(emailRequest.getLanguage()).append(".");
        }

        prompt.append("\nOriginal Email: \n"); // Newline for clarity
        prompt.append(emailRequest.getEmailContent()); // Append the user's email content
        return prompt.toString();
    }
}
