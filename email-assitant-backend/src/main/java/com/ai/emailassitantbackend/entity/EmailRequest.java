package com.ai.emailassitantbackend.entity;

import lombok.Data;

@Data
public class EmailRequest {
    private String emailContent;  // The original email content provided by the user
    private String tone;          // The desired tone for the email reply (e.g., "Professional", "Casual")
    private String desiredLength; // The desired length of the reply (e.g., "short", "medium", "long")
    private String keywords;      // Comma-separated keywords to include in the reply
    private String language;      // The desired output language for the reply
}
