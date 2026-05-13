package ro.utcn.travelpoints.travelpoints_backend.attraction.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record AttractionResponse(
        UUID id,
        String name,
        String description,
        String audioFile,
        BigDecimal entryPrice,
        //UUID locationId,
        String location,
      //  UUID categoryId,
        String categoryName,
        UUID createdBy,
        String offers
) {
}