package ro.utcn.travelpoints.travelpoints_backend.wishlist.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import ro.utcn.travelpoints.travelpoints_backend.wishlist.dto.WishlistResponse;
import ro.utcn.travelpoints.travelpoints_backend.wishlist.service.WishlistService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<List<WishlistResponse>> getWishlist(Authentication authentication) {
        List<WishlistResponse> response = wishlistService.getWishlist(authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{attractionId}")
    public ResponseEntity<Void> addToWishlist(
            @PathVariable UUID attractionId,
            Authentication authentication
    ) {
        wishlistService.addToWishlist(authentication.getName(), attractionId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{attractionId}")
    public ResponseEntity<Void> removeFromWishlist(
            @PathVariable UUID attractionId,
            Authentication authentication
    ) {
        wishlistService.removeFromWishlist(authentication.getName(), attractionId);
        return ResponseEntity.noContent().build();
    }
}