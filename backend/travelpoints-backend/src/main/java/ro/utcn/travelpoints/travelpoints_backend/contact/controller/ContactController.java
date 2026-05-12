package ro.utcn.travelpoints.travelpoints_backend.contact.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import ro.utcn.travelpoints.travelpoints_backend.common.dto.ApiResponse;
import ro.utcn.travelpoints.travelpoints_backend.contact.dto.ContactRequest;
import ro.utcn.travelpoints.travelpoints_backend.contact.service.EmailService;

@RestController
@RequestMapping("/contact")
@RequiredArgsConstructor
public class ContactController {

    private final EmailService emailService;

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> contactAdmin(
            @Valid @RequestBody ContactRequest request,
            Authentication authentication
    ) {
        String touristEmail = authentication.getName();
        emailService.sendEmailToAdmin(touristEmail, request.subject(), request.message());
        return ResponseEntity.ok(ApiResponse.success());
    }
}