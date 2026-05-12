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
import ro.utcn.travelpoints.travelpoints_backend.auth.dto.RegisterRequest;
import ro.utcn.travelpoints.travelpoints_backend.auth.dto.RegisterResponse;
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
                    .header("Access-Control-Expose-Headers", "authorization, Authorization")
                    .body(LoginResponse.ok());

        } catch (BadCredentialsException | UsernameNotFoundException ex) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(LoginResponse.fail("Invalid email or password"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        String token = authService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .header("Authorization", "Bearer " + token)
                .body(RegisterResponse.ok());
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ro.utcn.travelpoints.travelpoints_backend.common.dto.ApiResponse<Void>> forgotPassword(@org.springframework.web.bind.annotation.RequestParam("email") String email) {
        try {
            authService.createPasswordResetTokenForUser(email);
        } catch (Exception e) {
            // Returnam 200 OK chiar daca email-ul nu exista
        }
        return ResponseEntity.ok(ro.utcn.travelpoints.travelpoints_backend.common.dto.ApiResponse.success());
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ro.utcn.travelpoints.travelpoints_backend.common.dto.ApiResponse<Void>> resetPassword(
            @org.springframework.web.bind.annotation.RequestParam("token") String token,
            @org.springframework.web.bind.annotation.RequestParam("newPassword") String newPassword) {
        try {
            authService.resetPassword(token, newPassword);
            return ResponseEntity.ok(ro.utcn.travelpoints.travelpoints_backend.common.dto.ApiResponse.success());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ro.utcn.travelpoints.travelpoints_backend.common.dto.ApiResponse.error(e.getMessage()));
        }
    }

}