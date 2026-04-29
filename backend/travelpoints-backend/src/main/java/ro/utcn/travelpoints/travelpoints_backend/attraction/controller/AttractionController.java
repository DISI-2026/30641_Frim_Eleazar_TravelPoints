package ro.utcn.travelpoints.travelpoints_backend.attraction.controller;

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
import org.springframework.web.bind.annotation.GetMapping;
import java.util.List;

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

    @GetMapping("/search")
    public ResponseEntity<List<AttractionResponse>> searchAttractions(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "category", required = false) String category
    ) {
        List<AttractionResponse> results = attractionService.searchAttractions(keyword, location, category);
        return ResponseEntity.ok(results); // return 200 OK cu lista (sau array gol)
    }

}