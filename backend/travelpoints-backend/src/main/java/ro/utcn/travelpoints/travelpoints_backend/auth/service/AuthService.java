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
}