package ro.utcn.travelpoints.travelpoints_backend.attraction.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ro.utcn.travelpoints.travelpoints_backend.attraction.entity.Attraction;

import java.util.UUID;

@Repository
public interface AttractionRepository extends JpaRepository<Attraction, UUID> {
}