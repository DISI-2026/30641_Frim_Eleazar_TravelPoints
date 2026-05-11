package ro.utcn.travelpoints.travelpoints_backend.analytics.entity;

import jakarta.persistence.*;
import lombok.*;
import ro.utcn.travelpoints.travelpoints_backend.attraction.entity.Attraction;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "visits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Visit {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "attraction_id", nullable = false)
    private Attraction attraction;

    @Column(name = "visited_at", nullable = false)
    private LocalDateTime visitedAt;

    @PrePersist
    protected void onCreate() {
        this.visitedAt = LocalDateTime.now();
    }
}