package ro.utcn.travelpoints.travelpoints_backend.attraction.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ro.utcn.travelpoints.travelpoints_backend.attraction.dto.AttractionResponse;
import ro.utcn.travelpoints.travelpoints_backend.attraction.dto.UpdateAttractionRequest;
import ro.utcn.travelpoints.travelpoints_backend.attraction.service.AttractionService;
import ro.utcn.travelpoints.travelpoints_backend.common.dto.ApiResponse;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/attractions")
@RequiredArgsConstructor
public class AttractionController {

    private final AttractionService attractionService;

    @PostMapping(value = {"", "/create"})
    public ResponseEntity<ApiResponse<AttractionResponse>> createAttraction(
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String descriptionText,
            @RequestParam(value = "entryPrice", required = false) BigDecimal entryPrice,
            @RequestParam(value = "locationId", required = false) UUID locationId,
            @RequestParam(value = "categoryId", required = false) UUID categoryId,
            @RequestParam(value = "location", required = false) String locationName,
            @RequestParam(value = "audioFile", required = false) MultipartFile audioFile,
            Authentication authentication
    ) {
        String creatorEmail = authentication.getName();

        AttractionResponse response = attractionService.createAttraction(
                name, descriptionText, entryPrice,
                locationId, categoryId, locationName, audioFile, creatorEmail
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AttractionResponse>> updateAttraction(
            @PathVariable UUID id,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "description", required = false) String descriptionText,
            @RequestParam(value = "entryPrice", required = false) BigDecimal entryPrice,
            @RequestParam(value = "locationId", required = false) UUID locationId,
            @RequestParam(value = "categoryId", required = false) UUID categoryId,
            @RequestParam(value = "location", required = false) String locationName,
            @RequestParam(value = "offers", required = false) String offers,
            @RequestParam(value = "audioFile", required = false) org.springframework.web.multipart.MultipartFile audioFile
    ) {
        UpdateAttractionRequest request = new UpdateAttractionRequest(
                name, descriptionText, entryPrice, locationId, categoryId, offers
        );

        // Pasam 'locationName' si 'audioFile' catre serviciu
        AttractionResponse response = attractionService.updateAttraction(id, request, locationName, audioFile);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAttraction(@PathVariable UUID id) {
        attractionService.deleteAttraction(id);
        return ResponseEntity.ok(ApiResponse.success());
    }
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AttractionResponse>> getAttractionById(@PathVariable UUID id) {
        AttractionResponse response = attractionService.getAttractionById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AttractionResponse>>> getAllAttractions() {
        List<AttractionResponse> results = attractionService.searchAttractions(null, null, null);
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<AttractionResponse>>> searchAttractions(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "category", required = false) String category
    ) {
        List<AttractionResponse> results = attractionService.searchAttractions(keyword, location, category);
        return ResponseEntity.ok(ApiResponse.success(results));
    }
}