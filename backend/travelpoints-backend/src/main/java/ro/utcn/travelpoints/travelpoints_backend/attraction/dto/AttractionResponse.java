package ro.utcn.travelpoints.travelpoints_backend.attraction.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record AttractionResponse(
        UUID id,
        String name,
        String descriptionText,
        String descriptionAudioUrl,
        BigDecimal entryPrice,
        //UUID locationId,
        String locationName,
      //  UUID categoryId,
        String categoryName,
        UUID createdBy
) {
}