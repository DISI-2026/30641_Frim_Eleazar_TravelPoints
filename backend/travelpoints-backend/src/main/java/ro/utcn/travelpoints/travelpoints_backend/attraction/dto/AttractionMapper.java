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
               // attraction.getLocation().getId(),
                attraction.getLocation() != null ? attraction.getLocation().getName() : null,
              //  attraction.getCategory().getId(),
                attraction.getCategory() != null ? attraction.getCategory().getName() : null,
                attraction.getCreatedBy() != null ? attraction.getCreatedBy().getId() : null,
                attraction.getOffers()
        );
    }
}