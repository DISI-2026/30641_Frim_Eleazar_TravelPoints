package ro.utcn.travelpoints.travelpoints_backend.wishlist.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ro.utcn.travelpoints.travelpoints_backend.wishlist.entity.Wishlist;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, UUID> {

    List<Wishlist> findAllByUserId(UUID userId);
    Optional<Wishlist> findByUserIdAndAttractionId(UUID userId, UUID attractionId);
    boolean existsByUserIdAndAttractionId(UUID userId, UUID attractionId);
    void deleteAllByAttractionId(UUID attractionId);
    List<Wishlist> findAllByAttractionId(UUID attractionId);
}