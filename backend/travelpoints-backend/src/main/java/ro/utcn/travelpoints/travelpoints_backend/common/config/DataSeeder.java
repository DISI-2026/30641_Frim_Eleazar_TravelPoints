package ro.utcn.travelpoints.travelpoints_backend.common.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import ro.utcn.travelpoints.travelpoints_backend.attraction.entity.Category;
import ro.utcn.travelpoints.travelpoints_backend.attraction.entity.Location;
import ro.utcn.travelpoints.travelpoints_backend.attraction.repository.CategoryRepository;
import ro.utcn.travelpoints.travelpoints_backend.attraction.repository.LocationRepository;
import ro.utcn.travelpoints.travelpoints_backend.user.entity.Role;
import ro.utcn.travelpoints.travelpoints_backend.user.entity.User;
import ro.utcn.travelpoints.travelpoints_backend.user.repository.UserRepository;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CategoryRepository categoryRepository;
    private final LocationRepository locationRepository;

    @Override
    public void run(String... args) {
        // Users
        seedUser("admin@travelpoints.ro", "admin123", Role.ADMIN);
        seedUser("turist@travelpoints.ro", "turist123", Role.TOURIST);

        // Categories
        seedCategory("Muzeu");
        seedCategory("Monument");
        seedCategory("Parc");
        seedCategory("Biserica");
        seedCategory("Restaurant");

        // Locations
        seedLocation("Cluj-Napoca", new BigDecimal("46.7712601"), new BigDecimal("23.6236353"));
        seedLocation("Bucuresti", new BigDecimal("44.4267674"), new BigDecimal("26.1025384"));
        seedLocation("Brasov", new BigDecimal("45.6579615"), new BigDecimal("25.6012391"));
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

    private void seedCategory(String name) {
        if (categoryRepository.existsByName(name)) {
            return;
        }
        Category category = Category.builder().name(name).build();
        categoryRepository.save(category);
        log.info("Seeded category: {}", name);
    }

    private void seedLocation(String name, BigDecimal latitude, BigDecimal longitude) {
        boolean exists = locationRepository.findAll().stream()
                .anyMatch(l -> l.getName().equals(name));
        if (exists) {
            return;
        }
        Location location = Location.builder()
                .name(name)
                .latitude(latitude)
                .longitude(longitude)
                .build();
        locationRepository.save(location);
        log.info("Seeded location: {}", name);
    }
}