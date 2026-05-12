package ro.utcn.travelpoints.travelpoints_backend.contact.dto;

import jakarta.validation.constraints.NotBlank;

public record ContactRequest(
        @NotBlank(message = "Subiectul este obligatoriu")
        String subject,

        @NotBlank(message = "Mesajul este obligatoriu")
        String message
) {}