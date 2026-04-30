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
            String normalizedKeyword = keyword == null ? null : keyword.trim().toLowerCase();
            String normalizedLocation = location == null ? null : location.trim().toLowerCase();
            String normalizedCategory = category == null ? null : category.trim().toLowerCase();

            if (normalizedKeyword != null && !normalizedKeyword.isEmpty()) {
                String likePattern = "%" + normalizedKeyword + "%";
                Predicate namePredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), likePattern);
                Predicate descPredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("descriptionText")), likePattern);
                predicates.add(criteriaBuilder.or(namePredicate, descPredicate));
            }

            if (normalizedLocation != null && !normalizedLocation.isEmpty()) {
                predicates.add(criteriaBuilder.equal(
                        criteriaBuilder.lower(root.get("location").get("name")),
                        normalizedLocation
                ));
            }

            if (normalizedCategory != null && !normalizedCategory.isEmpty()) {
                predicates.add(criteriaBuilder.equal(
                        criteriaBuilder.lower(root.get("category").get("name")),
                        normalizedCategory
                ));
            }

            // Dacă nu s-a dat niciun filtru, întoarce toate înregistrările
            if (predicates.isEmpty()) {
                return criteriaBuilder.conjunction();  // <-- AICI: era disjunction()
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}