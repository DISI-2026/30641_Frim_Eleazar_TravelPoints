package ro.utcn.travelpoints.travelpoints_backend.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadDir = Paths.get("./uploads");
        String uploadPath = uploadDir.toFile().getAbsolutePath();

        // Expune fisierele din /uploads/audio la adresa http://localhost:8080/api/audio/...
        registry.addResourceHandler("/audio/**")
                .addResourceLocations("file:" + uploadPath + "/audio/");
    }
}