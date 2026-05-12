package ro.utcn.travelpoints.travelpoints_backend.wishlist.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.utcn.travelpoints.travelpoints_backend.attraction.entity.Attraction;
import ro.utcn.travelpoints.travelpoints_backend.attraction.repository.AttractionRepository;
import ro.utcn.travelpoints.travelpoints_backend.common.exception.ResourceNotFoundException;
import ro.utcn.travelpoints.travelpoints_backend.user.entity.User;
import ro.utcn.travelpoints.travelpoints_backend.user.repository.UserRepository;
import ro.utcn.travelpoints.travelpoints_backend.wishlist.dto.WishlistResponse;
import ro.utcn.travelpoints.travelpoints_backend.wishlist.entity.Wishlist;
import ro.utcn.travelpoints.travelpoints_backend.wishlist.repository.WishlistRepository;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final AttractionRepository attractionRepository;

    @Transactional(readOnly = true)
    public List<WishlistResponse> getWishlist(String email) {
        User user = findUser(email);
        return wishlistRepository.findAllByUserId(user.getId())
                .stream()
                .map(w -> new WishlistResponse(w.getAttraction().getId()))
                .toList();
    }

    @Transactional
    public void addToWishlist(String email, UUID attractionId) {
        User user = findUser(email);
        Attraction attraction = attractionRepository.findById(attractionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Attraction not found with id: " + attractionId));

        if (wishlistRepository.existsByUserIdAndAttractionId(user.getId(), attractionId)) {
            return; // idempotent — nu aruncam eroare daca exista deja
        }

        Wishlist wishlist = Wishlist.builder()
                .user(user)
                .attraction(attraction)
                .build();

        wishlistRepository.save(wishlist);
        log.info("User {} added attraction {} to wishlist", email, attractionId);
    }

    @Transactional
    public void removeFromWishlist(String email, UUID attractionId) {
        User user = findUser(email);
        Wishlist wishlist = wishlistRepository
                .findByUserIdAndAttractionId(user.getId(), attractionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Wishlist entry not found for attraction id: " + attractionId));

        wishlistRepository.delete(wishlist);
        log.info("User {} removed attraction {} from wishlist", email, attractionId);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found: " + email));
    }
}