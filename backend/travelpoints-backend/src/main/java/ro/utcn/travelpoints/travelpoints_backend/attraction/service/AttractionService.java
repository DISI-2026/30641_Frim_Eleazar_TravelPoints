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

    @Transactional
    public UUID createAttraction(
            String name,
            String descriptionText,
            BigDecimal entryPrice,
            UUID locationId,
            UUID categoryId,
            MultipartFile audioFile,
            String creatorEmail
    ) {
        // Conditionally fetch Location
        Location location = null;
        if (locationId != null) {
            location = locationRepository.findById(locationId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Location not found with id: " + locationId));
        }

        // Conditionally fetch Category
        Category category = null;
        if (categoryId != null) {
            category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Category not found with id: " + categoryId));
        }

        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Creator user not found: " + creatorEmail));

        // salvam audioul daca exista
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

        return saved.getId();
    }

    @Transactional
    public AttractionResponse updateAttraction(UUID id, UpdateAttractionRequest request) {
        Attraction attraction = attractionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Attraction not found with id: " + id));

        // null ii "nu modifica"
        if (request.name() != null) {
            attraction.setName(request.name());
        }

        if (request.descriptionText() != null) {
            attraction.setDescriptionText(request.descriptionText());
        }

        if (request.entryPrice() != null) {
            attraction.setEntryPrice(request.entryPrice());
        }

        if (request.locationId() != null) {
            Location location = locationRepository.findById(request.locationId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Location not found with id: " + request.locationId()));
            attraction.setLocation(location);
        }

        if (request.categoryId() != null) {
            Category category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Category not found with id: " + request.categoryId()));
            attraction.setCategory(category);
        }

        Attraction saved = attractionRepository.save(attraction);
        log.info("Updated attraction '{}' with id {}", saved.getName(), saved.getId());

        return AttractionMapper.toResponse(saved);
    }

    @Transactional
    public void deleteAttraction(UUID id) {
        Attraction attraction = attractionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Attraction not found with id: " + id));

        String audioPath = attraction.getDescriptionAudioUrl();

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

    @Transactional(readOnly = true)
    public AttractionResponse getAttractionById(UUID id) {
        Attraction attraction = attractionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Attraction not found with id: " + id));
        return AttractionMapper.toResponse(attraction);
    }
}