package ro.utcn.travelpoints.travelpoints_backend.wishlist.entity;

import jakarta.persistence.*;
import lombok.*;
import ro.utcn.travelpoints.travelpoints_backend.attraction.entity.Attraction;
import ro.utcn.travelpoints.travelpoints_backend.user.entity.User;

import java.util.UUID;

@Entity
@Table(name = "user_wishlist",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "attraction_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Wishlist {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "attraction_id", nullable = false)
    private Attraction attraction;
}