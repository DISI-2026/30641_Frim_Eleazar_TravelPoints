package ro.utcn.travelpoints.travelpoints_backend.auth.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ro.utcn.travelpoints.travelpoints_backend.auth.dto.LoginRequest;
import ro.utcn.travelpoints.travelpoints_backend.auth.dto.LoginResponse;
import ro.utcn.travelpoints.travelpoints_backend.auth.service.AuthService;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            String token = authService.login(request);

            return ResponseEntity
                    .ok()
                    .header("Authorization", "Bearer " + token)
                    .body(LoginResponse.ok());

        } catch (BadCredentialsException | UsernameNotFoundException ex) {
            // 401 Unauthorized
            // Mesaj 
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(LoginResponse.fail("Invalid email or password"));
        }
    }
}