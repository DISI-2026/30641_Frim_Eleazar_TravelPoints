package ro.utcn.travelpoints.travelpoints_backend.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.utcn.travelpoints.travelpoints_backend.auth.entity.PasswordResetToken;
import ro.utcn.travelpoints.travelpoints_backend.user.entity.User;

import java.util.Optional;
import java.util.UUID;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {
    Optional<PasswordResetToken> findByToken(String token);
    Optional<PasswordResetToken> findByUser(User user);
}