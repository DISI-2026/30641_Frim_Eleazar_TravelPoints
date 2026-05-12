package ro.utcn.travelpoints.travelpoints_backend.attraction.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import ro.utcn.travelpoints.travelpoints_backend.attraction.dto.AttractionMapper;
import ro.utcn.travelpoints.travelpoints_backend.attraction.dto.AttractionResponse;
import ro.utcn.travelpoints.travelpoints_backend.attraction.entity.Attraction;
import ro.utcn.travelpoints.travelpoints_backend.attraction.entity.Category;
import ro.utcn.travelpoints.travelpoints_backend.attraction.entity.Location;
import ro.utcn.travelpoints.travelpoints_backend.attraction.repository.AttractionRepository;
import ro.utcn.travelpoints.travelpoints_backend.attraction.repository.CategoryRepository;
import ro.utcn.travelpoints.travelpoints_backend.attraction.repository.LocationRepository;
import ro.utcn.travelpoints.travelpoints_backend.common.exception.ResourceNotFoundException;
import ro.utcn.travelpoints.travelpoints_backend.user.entity.User;
import ro.utcn.travelpoints.travelpoints_backend.user.repository.UserRepository;
import ro.utcn.travelpoints.travelpoints_backend.attraction.dto.UpdateAttractionRequest;
import org.springframework.data.jpa.domain.Specification;
import ro.utcn.travelpoints.travelpoints_backend.attraction.repository.AttractionSpecification;
import java.util.List;
import java.util.stream.Collectors;
import ro.utcn.travelpoints.travelpoints_backend.analytics.service.AnalyticsService;
import ro.utcn.travelpoints.travelpoints_backend.review.repository.ReviewRepository;
import ro.utcn.travelpoints.travelpoints_backend.wishlist.repository.WishlistRepository;
import ro.utcn.travelpoints.travelpoints_backend.analytics.repository.VisitRepository;
import ro.utcn.travelpoints.travelpoints_backend.notification.service.NotificationDispatcherService;
import java.util.Objects;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttractionService {

    private final AttractionRepository attractionRepository;
    private final CategoryRepository categoryRepository;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final AnalyticsService analyticsService;
    private final ReviewRepository reviewRepository;
    private final WishlistRepository wishlistRepository;
    private final VisitRepository visitRepository;
    private final NotificationDispatcherService notificationDispatcherService;

   @Transactional
public AttractionResponse createAttraction(
        String name,
        String descriptionText,
        BigDecimal entryPrice,
        UUID locationId,
        UUID categoryId,
        String locationName,
        MultipartFile audioFile,
        String creatorEmail
) {
    Location location;
    if (locationId != null) {
        location = locationRepository.findById(locationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Location not found with id: " + locationId));
    } else if (locationName != null && !locationName.isBlank()) {
        location = locationRepository.findAll().stream()
                .filter(l -> l.getName().equalsIgnoreCase(locationName.trim()))
                .findFirst()
                .orElseGet(() -> locationRepository.save(Location.builder()
                        .name(locationName.trim())
                        .latitude(java.math.BigDecimal.ZERO)
                        .longitude(java.math.BigDecimal.ZERO)
                        .build()));
    } else {
        throw new ResourceNotFoundException("Location must be provided (locationId or location name)");
    }

    // Categoria optionala momentan, dam default dacă nu vine
    Category category;
    if (categoryId != null) {
        category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + categoryId));
    } else {
        category = categoryRepository.findByName("Monument")
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Default category 'Monument' not found"));
    }

    User creator = userRepository.findByEmail(creatorEmail)
            .orElseThrow(() -> new ResourceNotFoundException(
                    "Creator user not found: " + creatorEmail));

    String audioPath = null;
    if (audioFile != null && !audioFile.isEmpty()) {
        audioPath = fileStorageService.storeAudio(audioFile);
    }

    Attraction attraction = Attraction.builder()
            .name(name)
            .descriptionText(descriptionText)
            .descriptionAudioUrl(audioPath)
            .entryPrice(entryPrice)
            .location(location)
            .category(category)
            .createdBy(creator)
            .build();

    Attraction saved = attractionRepository.save(attraction);
    log.info("Created attraction '{}' with id {} by user {}",
            saved.getName(), saved.getId(), creatorEmail);

    return AttractionMapper.toResponse(saved);
}

    @Transactional
    public AttractionResponse updateAttraction(UUID id, UpdateAttractionRequest request, String locationName, MultipartFile audioFile) {
        Attraction attraction = attractionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Attraction not found with id: " + id));

        // Retinem valoarea anterioara a campului "Oferte" pentru a detecta modificarea
        String previousOffers = attraction.getOffers();
        boolean offersChanged = false;

        if (request.name() != null) {
            attraction.setName(request.name());
        }

        if (request.descriptionText() != null) {
            attraction.setDescriptionText(request.descriptionText());
        }

        if (request.entryPrice() != null) {
            attraction.setEntryPrice(request.entryPrice());
        }

        // Update pentru campul "Oferte" - declanseaza evenimentul DOAR daca s-a modificat
        if (request.offers() != null && !Objects.equals(previousOffers, request.offers())) {
            attraction.setOffers(request.offers());
            offersChanged = true;
        }

        if (request.categoryId() != null) {
            Category category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Category not found with id: " + request.categoryId()));
            attraction.setCategory(category);
        }

        // Gestionare Locatie (dupa nume sau dupa ID)
        if (locationName != null && !locationName.isBlank()) {
            Location location = locationRepository.findAll().stream()
                    .filter(l -> l.getName().equalsIgnoreCase(locationName.trim()))
                    .findFirst()
                    .orElseGet(() -> locationRepository.save(Location.builder()
                            .name(locationName.trim())
                            .latitude(java.math.BigDecimal.ZERO)
                            .longitude(java.math.BigDecimal.ZERO)
                            .build()));
            attraction.setLocation(location);
        } else if (request.locationId() != null) {
            Location location = locationRepository.findById(request.locationId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Location not found with id: " + request.locationId()));
            attraction.setLocation(location);
        }

        // Gestionare Fisier Audio (daca nu e null, actualizam. Daca e null, pastram valoarea veche din BD)
        if (audioFile != null && !audioFile.isEmpty()) {
            String oldAudioPath = attraction.getDescriptionAudioUrl();

            // Stergem fisierul vechi pentru a nu ocupa spatiu inutil pe server
            if (oldAudioPath != null) {
                try {
                    fileStorageService.deleteAudio(oldAudioPath);
                } catch (Exception e) {
                    log.warn("Nu s-a putut sterge fisierul audio vechi pentru atractia {}: {}", id, e.getMessage());
                }
            }

            String newAudioPath = fileStorageService.storeAudio(audioFile);
            attraction.setDescriptionAudioUrl(newAudioPath);
        }

        Attraction saved = attractionRepository.save(attraction);
        log.info("Updated attraction '{}' with id {}", saved.getName(), saved.getId());

        // Declanseaza notificarea SSE exclusiv daca s-a modificat campul "Oferte"
        if (offersChanged) {
            try {
                notificationDispatcherService.dispatchOfferUpdate(saved);
            } catch (Exception e) {
                // Nu blocam request-ul daca push-ul esueaza
                log.warn("Failed to dispatch offer-update notification for attraction {}: {}",
                        saved.getId(), e.getMessage());
            }
        }

        return AttractionMapper.toResponse(saved);
    }

    @Transactional
    public void deleteAttraction(UUID id) {
        Attraction attraction = attractionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Attraction not found with id: " + id));

        String audioPath = attraction.getDescriptionAudioUrl();

        // Stergem dependentele inainte de a sterge atractia
        visitRepository.deleteAllByAttractionId(id);
        reviewRepository.deleteAllByAttractionId(id);
        wishlistRepository.deleteAllByAttractionId(id);

        attractionRepository.delete(attraction);
        log.info("Deleted attraction '{}' with id {}", attraction.getName(), id);

        if (audioPath != null) {
            try {
                fileStorageService.deleteAudio(audioPath);
            } catch (Exception e) {
                log.warn("Failed to delete audio file '{}' for attraction {}: {}",
                        audioPath, id, e.getMessage());
            }
        }
    }
    @Transactional(readOnly = true)
    public List<AttractionResponse> searchAttractions(String keyword, String location, String category) {
        Specification<Attraction> spec = AttractionSpecification.filterBy(keyword, location, category);
        List<Attraction> attractions = attractionRepository.findAll(spec);

        return attractions.stream()
                .map(AttractionMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttractionResponse> getAllAttractions() {
        List<Attraction> attractions = attractionRepository.findAll();
        return attractions.stream()
                .map(AttractionMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AttractionResponse getAttractionById(UUID id) {
        Attraction attraction = attractionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Attraction not found with id: " + id));
        analyticsService.recordVisit(id);
        return AttractionMapper.toResponse(attraction);
    }
}