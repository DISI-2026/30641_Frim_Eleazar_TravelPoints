package ro.utcn.travelpoints.travelpoints_backend.analytics.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ro.utcn.travelpoints.travelpoints_backend.analytics.dto.PopularAttractionResponse;
import ro.utcn.travelpoints.travelpoints_backend.analytics.entity.Visit;

import java.util.List;
import java.util.UUID;

@Repository
public interface VisitRepository extends JpaRepository<Visit, UUID> {
    List<Visit> findAllByAttractionId(UUID attractionId);
    void deleteAllByAttractionId(UUID attractionId);

    /**
     * Top atractii dupa numarul de vizite, ordonate descrescator.
     * Folosim Pageable pentru a limita la 10 (PageRequest.of(0, 10)).
     */
    @Query("""
            SELECT new ro.utcn.travelpoints.travelpoints_backend.analytics.dto.PopularAttractionResponse(
                v.attraction.id, v.attraction.name, COUNT(v)
            )
            FROM Visit v
            GROUP BY v.attraction.id, v.attraction.name
            ORDER BY COUNT(v) DESC
            """)
    List<PopularAttractionResponse> findTopPopular(Pageable pageable);
}