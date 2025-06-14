package com.ai.emailassitantbackend.controller;

import com.ai.emailassitantbackend.entity.EmailRequest;
import com.ai.emailassitantbackend.service.EmailGeneratorService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/api/email")
public class EmailGeneratorController {

    private final EmailGeneratorService emailGeneratorService;

    @PostMapping("/generate")
    public ResponseEntity<String> generateEmail(@RequestBody EmailRequest emailRequest) {
        // Call the service to generate the email reply
        String response = emailGeneratorService.generateEmailReply(emailRequest);
        // Return the response as a successful HTTP 200 OK
        return ResponseEntity.ok(response);
    }
}
