package ro.utcn.travelpoints.travelpoints_backend.review.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import ro.utcn.travelpoints.travelpoints_backend.common.dto.ApiResponse;
import ro.utcn.travelpoints.travelpoints_backend.review.dto.ReviewRequest;
import ro.utcn.travelpoints.travelpoints_backend.review.dto.ReviewResponse;
import ro.utcn.travelpoints.travelpoints_backend.review.service.ReviewService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/attractions/{id}/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getReviews(@PathVariable UUID id) {
        List<ReviewResponse> response = reviewService.getReviewsForAttraction(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> addReview(
            @PathVariable UUID id,
            @RequestBody ReviewRequest request,
            Authentication authentication
    ) {
        // extragem email-ul din SecurityContextHolder prin parametrul 'Authentication'
        reviewService.addReview(id, authentication.getName(), request);

        // Returnam 200 OK asa cum cere interfata axios din frontend
        return ResponseEntity.ok(ApiResponse.success());
    }
}