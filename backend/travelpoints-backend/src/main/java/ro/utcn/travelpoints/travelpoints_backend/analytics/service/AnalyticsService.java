package ro.utcn.travelpoints.travelpoints_backend.analytics.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import ro.utcn.travelpoints.travelpoints_backend.analytics.dto.HourlyStat;
import ro.utcn.travelpoints.travelpoints_backend.analytics.dto.MonthlyStat;
import ro.utcn.travelpoints.travelpoints_backend.analytics.dto.PopularAttractionResponse;
import ro.utcn.travelpoints.travelpoints_backend.analytics.entity.Visit;
import ro.utcn.travelpoints.travelpoints_backend.analytics.repository.VisitRepository;
import ro.utcn.travelpoints.travelpoints_backend.attraction.entity.Attraction;
import ro.utcn.travelpoints.travelpoints_backend.attraction.repository.AttractionRepository;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final VisitRepository visitRepository;
    private final AttractionRepository attractionRepository;

    // Folosim o tranzactie noua pentru a putea fi apelata fara sa blocheze operatiunile read-only
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordVisit(UUID attractionId) {
        attractionRepository.findById(attractionId).ifPresent(attraction -> {
            Visit visit = Visit.builder()
                    .attraction(attraction)
                    .build();
            visitRepository.save(visit);
        });
    }

    @Transactional(readOnly = true)
    public List<HourlyStat> getHourlyStats(UUID attractionId) {
        List<Visit> visits = visitRepository.findAllByAttractionId(attractionId);

        Map<Integer, Long> countByHour = visits.stream()
                .collect(Collectors.groupingBy(
                        v -> v.getVisitedAt().getHour(),
                        Collectors.counting()
                ));

        return countByHour.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> new HourlyStat(String.format("%02d:00", e.getKey()), e.getValue()))
                .collect(Collectors.toList());
    }

    /**
     * Returneaza Top 10 atractii dupa numarul total de vizite (descrescator).
     * Folosit in dashboard-ul administratorului - GET /api/analytics/popular.
     */
    @Transactional(readOnly = true)
    public List<PopularAttractionResponse> getTop10Popular() {
        return visitRepository.findTopPopular(PageRequest.of(0, 10));
    }

    @Transactional(readOnly = true)
    public List<MonthlyStat> getMonthlyStats(UUID attractionId) {
        List<Visit> visits = visitRepository.findAllByAttractionId(attractionId);
        String[] monthNames = {"", "Ian", "Feb", "Mar", "Apr", "Mai", "Iun", "Iul", "Aug", "Sep", "Oct", "Nov", "Dec"};

        Map<Integer, Long> countByMonth = visits.stream()
                .collect(Collectors.groupingBy(
                        v -> v.getVisitedAt().getMonthValue(),
                        Collectors.counting()
                ));

        return countByMonth.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> new MonthlyStat(monthNames[e.getKey()], e.getValue()))
                .collect(Collectors.toList());
    }
}