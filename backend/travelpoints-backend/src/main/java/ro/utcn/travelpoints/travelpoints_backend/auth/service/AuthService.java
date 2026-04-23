package ro.utcn.travelpoints.travelpoints_backend.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import ro.utcn.travelpoints.travelpoints_backend.auth.dto.LoginRequest;
import ro.utcn.travelpoints.travelpoints_backend.auth.security.JwtService;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;

    public String login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                )
        );
        //generam tokenu dacaa am ajuns aici
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.email());
        return jwtService.generateToken(userDetails);
    }
}