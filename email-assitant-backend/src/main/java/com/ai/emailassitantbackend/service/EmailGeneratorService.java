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

    private final RestTemplate restTemplate; // Blocking HTTP client
    private final ObjectMapper objectMapper; // ObjectMapper for JSON processing


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
        // Build the prompt string to send to the Gemini API
        String prompt = buildPrompt(emailRequest);

        // Construct the full API URL including the base URL, model path, and API key as a query parameter
        String fullApiUrl = geminiAPIURL + geminiModelPath + "?key=" + geminiAPIKey;

        // Construct the request body as a Map, following the Gemini API's expected JSON structure
        Map<String, Object> requestBody = Map.of(
                "contents", List.of( // List of content blocks
                        Map.of("parts", List.of( // List of parts within a content block
                                Map.of("text", prompt) // The actual text prompt
                        ))
                )
        );

        // Set up HTTP headers for the request
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON); // Set Content-Type to application/json

        // Create an HttpEntity to wrap the request body and headers
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        String responseBody = null; // Variable to hold the raw response body from the API
        try {
            // Make the POST request to the Gemini API using RestTemplate
            // postForEntity sends a POST request and returns the response as ResponseEntity
            ResponseEntity<String> response = restTemplate.postForEntity(fullApiUrl, requestEntity, String.class);
            responseBody = response.getBody(); // Get the response body as a String

            // Extract the actual text content from the API's JSON response
            return extractResponseContent(responseBody);

        } catch (HttpClientErrorException e) {
            // Catch 4xx client errors (e.g., 400 Bad Request, 401 Unauthorized, 404 Not Found)
            System.err.println("Client error calling Gemini API: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            return "Client error from Gemini API: " + e.getStatusCode() + " - " + e.getStatusText() + " - " + e.getResponseBodyAsString();
        } catch (HttpServerErrorException e) {
            // Catch 5xx server errors (e.g., 500 Internal Server Error)
            System.err.println("Server error from Gemini API: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            return "Server error from Gemini API: " + e.getStatusCode() + " - " + e.getStatusText() + " - " + e.getResponseBodyAsString();
        } catch (ResourceAccessException e) {
            // Catch network related errors (e.g., connection refused, DNS issues, timeouts)
            System.err.println("Network/Resource access error during API call: " + e.getMessage());
            e.printStackTrace(); // Print stack trace for debugging connection issues
            return "Network error: " + e.getMessage();
        } catch (Exception e) {
            // Catch any other unexpected exceptions
            System.err.println("An unexpected error occurred during API call: " + e.getMessage());
            e.printStackTrace(); // Print stack trace for debugging
            return "An unexpected error occurred: " + e.getMessage();
        }
    }

    private String extractResponseContent(String response) {
        // Handle cases where the response is null or empty
        if (response == null || response.isEmpty()) {
            return "No response received from the API.";
        }
        try {
            // Parse the JSON response
            JsonNode rootNode = objectMapper.readTree(response);
            // Navigate through the JSON tree to find the 'text' field
            JsonNode textNode = rootNode.path("candidates")
                    .get(0) // Get the first candidate
                    .path("content")
                    .path("parts")
                    .get(0) // Get the first part
                    .path("text"); // Get the 'text' field

            // Check if the text node exists and is textual, then return its content
            if (textNode != null && textNode.isTextual()) {
                return textNode.asText();
            } else {
                // If the expected structure is not found, return an informative message
                return "Could not extract 'text' from Gemini API response. Response structure might be unexpected: " + response;
            }
        } catch (Exception e) {
            // Catch any errors during JSON parsing
            System.err.println("Error parsing Gemini API response: " + e.getMessage());
            e.printStackTrace(); // Print stack trace for debugging
            return "Error processing API response: " + e.getMessage();
        }
    }


    private String buildPrompt(EmailRequest emailRequest) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Generate an email reply based on the following content. Do not include a subject line in the response.");

        if (emailRequest.getTone() != null && !emailRequest.getTone().isEmpty()) {
            prompt.append("Use a ").append(emailRequest.getTone()).append(" tone.");
        }
        prompt.append("\nOriginal Email: \n");
        prompt.append(emailRequest.getEmailContent());
        return prompt.toString();
    }
}
