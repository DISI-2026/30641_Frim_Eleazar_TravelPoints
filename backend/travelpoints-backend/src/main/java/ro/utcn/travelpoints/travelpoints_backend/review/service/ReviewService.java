package ro.utcn.travelpoints.travelpoints_backend.review.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.utcn.travelpoints.travelpoints_backend.attraction.entity.Attraction;
import ro.utcn.travelpoints.travelpoints_backend.attraction.repository.AttractionRepository;
import ro.utcn.travelpoints.travelpoints_backend.common.exception.ResourceNotFoundException;
import ro.utcn.travelpoints.travelpoints_backend.review.dto.ReviewRequest;
import ro.utcn.travelpoints.travelpoints_backend.review.dto.ReviewResponse;
import ro.utcn.travelpoints.travelpoints_backend.review.entity.Review;
import ro.utcn.travelpoints.travelpoints_backend.review.repository.ReviewRepository;
import ro.utcn.travelpoints.travelpoints_backend.user.entity.User;
import ro.utcn.travelpoints.travelpoints_backend.user.repository.UserRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final AttractionRepository attractionRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsForAttraction(UUID attractionId) {
        return reviewRepository.findAllByAttractionIdOrderByCreatedAtDesc(attractionId)
                .stream()
                .map(r -> new ReviewResponse(r.getId(), r.getUser().getEmail(), r.getText()))
                .collect(Collectors.toList());
    }

    @Transactional
    public void addReview(UUID attractionId, String email, ReviewRequest request) {
        Attraction attraction = attractionRepository.findById(attractionId)
                .orElseThrow(() -> new ResourceNotFoundException("Attraction not found with id: " + attractionId));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Review review = Review.builder()
                .attraction(attraction)
                .user(user)
                .text(request.text())
                .build();

        reviewRepository.save(review);
    }
}