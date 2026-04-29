package ro.utcn.travelpoints.travelpoints_backend.attraction.repository;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import ro.utcn.travelpoints.travelpoints_backend.attraction.entity.Attraction;

import java.util.ArrayList;
import java.util.List;

public class AttractionSpecification {

    public static Specification<Attraction> filterBy(String keyword, String location, String category) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Cautare dupa keyword in nume sau in textul descrierii
            if (keyword != null && !keyword.trim().isEmpty()) {
                String likePattern = "%" + keyword.toLowerCase() + "%";
                Predicate namePredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), likePattern);
                Predicate descPredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("descriptionText")), likePattern);
                predicates.add(criteriaBuilder.or(namePredicate, descPredicate));
            }

            // Filtrare dupa numele locatiei
            if (location != null && !location.trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(
                        criteriaBuilder.lower(root.get("location").get("name")),
                        location.toLowerCase()
                ));
            }

            // Filtrare dupa numele categoriei
            if (category != null && !category.trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(
                        criteriaBuilder.lower(root.get("category").get("name")),
                        category.toLowerCase()
                ));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}