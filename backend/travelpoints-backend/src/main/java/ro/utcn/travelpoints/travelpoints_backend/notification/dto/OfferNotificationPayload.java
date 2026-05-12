package ro.utcn.travelpoints.travelpoints_backend.notification.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.UUID;

/**
 * Payload SSE trimis catre frontend cand campul "Oferte" al unei atractii este modificat.
 * Structura este aliniata cu contractul frontend-ului (vezi mockoon-config.json):
 *   data: {"id_atractie": ..., "message": "..."}
 */
public record OfferNotificationPayload(
        @JsonProperty("id_atractie") UUID idAtractie,
        String message
) {
}
