package ro.utcn.travelpoints.travelpoints_backend.analytics.dto;

import java.util.UUID;

/**
 * Reprezinta o atractie populara, in forma asteptata de frontend:
 *   { "attractionId": "<uuid>", "name": "<nume>", "views": <numar_vizite> }
 *
 * Folosita pentru endpoint-ul GET /api/analytics/popular (Top 10 atractii dupa vizite).
 */
public record PopularAttractionResponse(
        UUID attractionId,
        String name,
        long views
) {
}
