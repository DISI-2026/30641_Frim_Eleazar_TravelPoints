package ro.utcn.travelpoints.travelpoints_backend.attraction.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.UUID;

public record UpdateAttractionRequest(

        @Size(min = 1, max = 255, message = "Name must be between 1 and 255 characters")
        String name,

        String descriptionText,

        @DecimalMin(value = "0.0", inclusive = true, message = "Entry price cannot be negative")
        BigDecimal entryPrice,

        UUID locationId,

        UUID categoryId
) {
}