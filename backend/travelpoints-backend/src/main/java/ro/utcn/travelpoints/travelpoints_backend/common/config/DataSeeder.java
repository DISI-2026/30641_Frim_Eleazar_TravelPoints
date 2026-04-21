package ro.utcn.travelpoints.travelpoints_backend.common.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import ro.utcn.travelpoints.travelpoints_backend.user.entity.Role;
import ro.utcn.travelpoints.travelpoints_backend.user.entity.User;
import ro.utcn.travelpoints.travelpoints_backend.user.repository.UserRepository;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUser("admin@travelpoints.ro", "admin123", Role.ADMIN);
        seedUser("turist@travelpoints.ro", "turist123", Role.TOURIST);
    }

    private void seedUser(String email, String rawPassword, Role role) {
        if (userRepository.existsByEmail(email)) {
            log.info("User {} already exists, skipping seed.", email);
            return;
        }
        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .role(role)
                .build();
        userRepository.save(user);
        log.info("Seeded user: {} with role {}", email, role);
    }
}