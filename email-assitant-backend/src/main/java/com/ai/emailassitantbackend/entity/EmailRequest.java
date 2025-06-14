package com.ai.emailassitantbackend.entity;

import lombok.Data;

@Data
public class EmailRequest {
    private String emailContent; // The email content provided by the user for which a reply needs to be generated
    private String tone; // The desired tone for the email reply (e.g., "formal", "friendly", "concise")
}
