package ro.utcn.travelpoints.travelpoints_backend.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.utcn.travelpoints.travelpoints_backend.auth.dto.LoginRequest;
import ro.utcn.travelpoints.travelpoints_backend.auth.dto.RegisterRequest;
import ro.utcn.travelpoints.travelpoints_backend.auth.entity.PasswordResetToken;
import ro.utcn.travelpoints.travelpoints_backend.auth.security.JwtService;
import ro.utcn.travelpoints.travelpoints_backend.common.exception.EmailAlreadyExistsException;
import ro.utcn.travelpoints.travelpoints_backend.user.entity.Role;
import ro.utcn.travelpoints.travelpoints_backend.user.entity.User;
import ro.utcn.travelpoints.travelpoints_backend.user.repository.UserRepository;


@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ro.utcn.travelpoints.travelpoints_backend.auth.repository.PasswordResetTokenRepository tokenRepository;
    private final ro.utcn.travelpoints.travelpoints_backend.contact.service.EmailService emailService;


    public String login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                )
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.email());
        return jwtService.generateToken(userDetails);
    }

    @Transactional
    public String register(RegisterRequest request) {
        
        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyExistsException(
                    "An account with this email already exists"
            );
        }

        User newUser = User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(Role.TOURIST)
                .build();

        User saved = userRepository.save(newUser);
        log.info("Registered new user: {} with role {}", saved.getEmail(), saved.getRole());

        //useru ii direct autentificat după register
        UserDetails userDetails = userDetailsService.loadUserByUsername(saved.getEmail());
        return jwtService.generateToken(userDetails);
    }
    @Transactional
    public void createPasswordResetTokenForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ro.utcn.travelpoints.travelpoints_backend.common.exception.ResourceNotFoundException("User nu a fost gasit"));

        // Daca exista un token vechi, il stergem
        tokenRepository.findByUser(user).ifPresent(tokenRepository::delete);

        String token = java.util.UUID.randomUUID().toString();
        PasswordResetToken myToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(java.time.LocalDateTime.now().plusMinutes(30))
                .build();
        tokenRepository.save(myToken);

        emailService.sendPasswordResetEmail(user.getEmail(), token);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Token invalid sau inexistent"));

        if (resetToken.getExpiryDate().isBefore(java.time.LocalDateTime.now())) {
            tokenRepository.delete(resetToken);
            throw new RuntimeException("Token expirat");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        tokenRepository.delete(resetToken);
    }
}