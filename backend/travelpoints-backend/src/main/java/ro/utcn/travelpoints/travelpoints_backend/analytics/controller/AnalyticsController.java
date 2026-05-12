package ro.utcn.travelpoints.travelpoints_backend.analytics.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ro.utcn.travelpoints.travelpoints_backend.analytics.service.AnalyticsService;
import ro.utcn.travelpoints.travelpoints_backend.common.dto.ApiResponse;

import java.util.UUID;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/{id}/time")
    public ResponseEntity<ApiResponse<Object>> getAnalytics(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "hour") String granularity) {

        if ("hour".equalsIgnoreCase(granularity)) {
            return ResponseEntity.ok(ApiResponse.success(analyticsService.getHourlyStats(id)));
        } else if ("month".equalsIgnoreCase(granularity)) {
            return ResponseEntity.ok(ApiResponse.success(analyticsService.getMonthlyStats(id)));
        }

        return ResponseEntity.badRequest().body(ApiResponse.error("Granularitate invalida. Alege 'hour' sau 'month'."));
    }
}