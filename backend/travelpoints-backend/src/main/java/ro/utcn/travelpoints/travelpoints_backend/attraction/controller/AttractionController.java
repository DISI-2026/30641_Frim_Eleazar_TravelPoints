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
import ro.utcn.travelpoints.travelpoints_backend.common.dto.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.HashMap;
import java.util.List;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/attractions")
@RequiredArgsConstructor
public class AttractionController {

    private final AttractionService attractionService;

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createAttraction(
            @RequestParam("name") String name,
            @RequestParam(value = "descriptionText", required = false) String descriptionText,
            @RequestParam(value = "entryPrice", required = false) BigDecimal entryPrice,
            @RequestParam(value = "locationId",required = false) UUID locationId,
            @RequestParam(value = "categoryId",required = false) UUID categoryId,
            @RequestParam(value = "audioFile", required = false) MultipartFile audioFile,
            Authentication authentication
    ) {
        String creatorEmail = authentication.getName(); // email-ul din JWT

        UUID response_id = attractionService.createAttraction(
                name, descriptionText, entryPrice,
                locationId, categoryId, audioFile, creatorEmail
        );

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("success", true);
        responseBody.put("id", response_id); // Preluam ID-ul generat

        return ResponseEntity.status(HttpStatus.CREATED).body(responseBody);

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

    @GetMapping("")
    public ResponseEntity<ApiResponse<List<AttractionResponse>>> getAllAttractions() {
        List<AttractionResponse> attractions = attractionService.getAllAttractions();
        ApiResponse<List<AttractionResponse>> apiResponse = ApiResponse.<List<AttractionResponse>>builder()
                .success(true)
                .data(attractions)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<AttractionResponse>>> searchAttractions(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "category", required = false) String category
    ) {
        List<AttractionResponse> results = attractionService.searchAttractions(keyword, location, category);
        ApiResponse<List<AttractionResponse>> apiResponse = ApiResponse.<List<AttractionResponse>>builder()
                .success(true)
                .data(results)
                .build();
        return ResponseEntity.ok(apiResponse); // return 200 OK cu lista (sau array gol)
    }
    @GetMapping("/{id}")
    public ResponseEntity<AttractionResponse> getAttractionById(@PathVariable UUID id) {
        AttractionResponse response = attractionService.getAttractionById(id);
        return ResponseEntity.ok(response);
    }

}