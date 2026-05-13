package ro.utcn.travelpoints.travelpoints_backend.notification.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.http.HttpStatus;

import ro.utcn.travelpoints.travelpoints_backend.auth.security.JwtService;
import ro.utcn.travelpoints.travelpoints_backend.common.exception.ResourceNotFoundException;
import ro.utcn.travelpoints.travelpoints_backend.notification.service.NotificationDispatcherService;
import ro.utcn.travelpoints.travelpoints_backend.user.entity.User;
import ro.utcn.travelpoints.travelpoints_backend.user.repository.UserRepository;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationDispatcherService notificationDispatcherService;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    /**
     * Endpoint SSE pentru notificari in timp real.
     * Clientul se conecteaza prin EventSource (care nu suporta headere custom),
     * de aceea acceptam JWT-ul si ca query param (?token=...).
     * Daca exista un Authentication deja stabilit (header Authorization), il folosim direct.
     */
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@RequestParam(value = "token", required = false) String token) {
        String email = resolveUserEmail(token);
        if (email == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required for SSE stream");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        log.info("Opening SSE stream for user {}", email);
        return notificationDispatcherService.register(user.getId());
    }

    private String resolveUserEmail(String token) {
        // 1) Daca Spring Security a setat deja un Authentication, il folosim
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()
                && !"anonymousUser".equals(String.valueOf(auth.getPrincipal()))) {
            return auth.getName();
        }

        // 2) Altfel, incercam tokenul din query param (cazul tipic EventSource)
        if (token != null && !token.isBlank()) {
            try {
                return jwtService.extractUsername(token);
            } catch (Exception e) {
                log.warn("Invalid JWT passed as query param to SSE stream: {}", e.getMessage());
                return null;
            }
        }
        return null;
    }
}
