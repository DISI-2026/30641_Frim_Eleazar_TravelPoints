package ro.utcn.travelpoints.travelpoints_backend.review.dto;

import java.util.UUID;

public record ReviewResponse(
        UUID id,
        String author,
        String text
) {}