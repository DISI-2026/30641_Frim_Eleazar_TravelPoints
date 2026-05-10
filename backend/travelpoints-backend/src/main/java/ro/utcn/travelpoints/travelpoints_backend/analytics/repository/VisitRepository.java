package ro.utcn.travelpoints.travelpoints_backend.analytics.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ro.utcn.travelpoints.travelpoints_backend.analytics.entity.Visit;

import java.util.List;
import java.util.UUID;

@Repository
public interface VisitRepository extends JpaRepository<Visit, UUID> {
    List<Visit> findAllByAttractionId(UUID attractionId);
    void deleteAllByAttractionId(UUID attractionId);
}