package ro.utcn.travelpoints.travelpoints_backend.attraction.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    String storeAudio(MultipartFile file);
    void deleteAudio(String relativePath);
}