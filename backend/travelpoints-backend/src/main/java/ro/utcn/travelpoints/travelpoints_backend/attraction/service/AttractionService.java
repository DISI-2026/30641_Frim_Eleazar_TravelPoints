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
    public AttractionResponse createAttraction(
            String name,
            String descriptionText,
            BigDecimal entryPrice,
            UUID locationId,
            UUID categoryId,
            MultipartFile audioFile,
            String creatorEmail
    ) {
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Location not found with id: " + locationId));

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + categoryId));

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

        return AttractionMapper.toResponse(saved);
    }
}