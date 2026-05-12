package ro.utcn.travelpoints.travelpoints_backend.wishlist.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ro.utcn.travelpoints.travelpoints_backend.common.dto.ApiResponse;
import ro.utcn.travelpoints.travelpoints_backend.wishlist.dto.WishlistResponse;
import ro.utcn.travelpoints.travelpoints_backend.wishlist.service.WishlistService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import java.util.UUID;

import java.util.List;

@RestController
@RequestMapping("/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<WishlistResponse>>> getWishlist(Authentication authentication) {
        List<WishlistResponse> response = wishlistService.getWishlist(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{attractionId}")
    public ResponseEntity<ApiResponse<Void>> addToWishlist(
            @PathVariable UUID attractionId,
            Authentication authentication
    ) {
        wishlistService.addToWishlist(authentication.getName(), attractionId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success());
    }

    @DeleteMapping("/{attractionId}")
    public ResponseEntity<ApiResponse<Void>> removeFromWishlist(
            @PathVariable UUID attractionId,
            Authentication authentication
    ) {
        wishlistService.removeFromWishlist(authentication.getName(), attractionId);
        return ResponseEntity.ok(ApiResponse.success());
    }
}