package ro.utcn.travelpoints.travelpoints_backend.attraction.controller;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import ro.utcn.travelpoints.travelpoints_backend.attraction.dto.UpdateAttractionRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import ro.utcn.travelpoints.travelpoints_backend.attraction.dto.AttractionResponse;
import ro.utcn.travelpoints.travelpoints_backend.attraction.service.AttractionService;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/attractions")
@RequiredArgsConstructor
public class AttractionController {

    private final AttractionService attractionService;

    @PostMapping
    public ResponseEntity<AttractionResponse> createAttraction(
            @RequestParam("name") String name,
            @RequestParam(value = "descriptionText", required = false) String descriptionText,
            @RequestParam(value = "entryPrice", required = false) BigDecimal entryPrice,
            @RequestParam("locationId") UUID locationId,
            @RequestParam("categoryId") UUID categoryId,
            @RequestParam(value = "audioFile", required = false) MultipartFile audioFile,
            Authentication authentication
    ) {
        String creatorEmail = authentication.getName(); // email-ul din JWT

        AttractionResponse response = attractionService.createAttraction(
                name, descriptionText, entryPrice,
                locationId, categoryId, audioFile, creatorEmail
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    @PutMapping("/{id}")
    public ResponseEntity<AttractionResponse> updateAttraction(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateAttractionRequest request
    ) {
        AttractionResponse response = attractionService.updateAttraction(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttraction(@PathVariable UUID id) {
        attractionService.deleteAttraction(id);
        return ResponseEntity.noContent().build();
    }
}