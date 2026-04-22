package ro.utcn.travelpoints.travelpoints_backend.attraction.service;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import ro.utcn.travelpoints.travelpoints_backend.common.exception.InvalidFileException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class LocalFileStorageService implements FileStorageService {

    @Value("${app.storage.upload-dir}")
    private String uploadDir;

    @Value("${app.storage.audio-subdir}")
    private String audioSubdir;

    @Value("${app.storage.allowed-audio-extensions}")
    private String allowedExtensionsCsv;

    private Path audioStoragePath;
    private List<String> allowedExtensions;

    @PostConstruct
    public void init() {
        this.audioStoragePath = Paths.get(uploadDir, audioSubdir).toAbsolutePath().normalize();
        this.allowedExtensions = Arrays.stream(allowedExtensionsCsv.split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .toList();

        try {
            Files.createDirectories(audioStoragePath);
            log.info("Audio storage initialized at: {}", audioStoragePath);
            log.info("Allowed audio extensions: {}", allowedExtensions);
        } catch (IOException e) {
            throw new RuntimeException("Could not create audio storage directory", e);
        }
    }

    @Override
    public String storeAudio(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("Audio file is required and cannot be empty");
        }

        String originalFilename = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "unknown"
        );
        String extension = getExtension(originalFilename);

        if (!allowedExtensions.contains(extension)) {
            throw new InvalidFileException(
                    "Invalid audio format '" + extension + "'. Allowed: " + allowedExtensions
            );
        }

        // Generăm nume unic ca să evităm coliziuni (2 useri care încarcă "track.mp3")
        String uniqueFilename = UUID.randomUUID() + "." + extension;
        Path targetPath = audioStoragePath.resolve(uniqueFilename);

        try {
            Files.copy(file.getInputStream(), targetPath);
            log.info("Stored audio file: {}", targetPath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store audio file", e);
        }

        // Întoarcem path-ul relativ (fără rădăcina uploads/) ca să-l salvăm în DB.
        // Ex: "audio/a3f8c2d1-....mp3"
        return audioSubdir + "/" + uniqueFilename;
    }

    @Override
    public void deleteAudio(String relativePath) {
        if (relativePath == null || relativePath.isBlank()) {
            return;
        }
        try {
            // relativePath e "audio/xxx.mp3", iar audioStoragePath e "...uploads/audio"
            // deci scoatem subdir-ul din față
            String filename = relativePath.startsWith(audioSubdir + "/")
                    ? relativePath.substring(audioSubdir.length() + 1)
                    : relativePath;
            Path target = audioStoragePath.resolve(filename);
            Files.deleteIfExists(target);
            log.info("Deleted audio file: {}", target);
        } catch (IOException e) {
            log.error("Failed to delete audio file: {}", relativePath, e);
        }
    }

    private String getExtension(String filename) {
        int lastDot = filename.lastIndexOf('.');
        if (lastDot == -1 || lastDot == filename.length() - 1) {
            return "";
        }
        return filename.substring(lastDot + 1).toLowerCase();
    }
}