package com.ai.emailassitantbackend.entity;

import lombok.Data;

@Data
public class EmailRequest {
    private String emailContent;
    private String tone;
    private String desiredLength;
    private String keywords;
    private String language;
}
