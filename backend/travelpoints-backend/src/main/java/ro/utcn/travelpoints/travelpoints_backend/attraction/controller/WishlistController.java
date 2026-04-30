package ro.utcn.travelpoints.travelpoints_backend.attraction.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ro.utcn.travelpoints.travelpoints_backend.common.dto.ApiResponse;

import java.util.List;

@RestController
@RequestMapping("/wishlist")
public class WishlistController {

    @GetMapping
    public ResponseEntity<ApiResponse<List<Object>>> getWishlists() {
        return ResponseEntity.ok(ApiResponse.success(List.of()));
    }
}