package ro.utcn.travelpoints.travelpoints_backend.attraction.dto;

import ro.utcn.travelpoints.travelpoints_backend.attraction.entity.Attraction;

public class AttractionMapper {

    private AttractionMapper() {
        // utility class
    }

    public static AttractionResponse toResponse(Attraction attraction) {
        return new AttractionResponse(
                attraction.getId(),
                attraction.getName(),
                attraction.getDescriptionText(),
                attraction.getDescriptionAudioUrl(),
                attraction.getEntryPrice(),
                attraction.getLocation().getId(),
                attraction.getLocation().getName(),
                attraction.getCategory().getId(),
                attraction.getCategory().getName(),
                attraction.getCreatedBy().getId()
        );
    }
}