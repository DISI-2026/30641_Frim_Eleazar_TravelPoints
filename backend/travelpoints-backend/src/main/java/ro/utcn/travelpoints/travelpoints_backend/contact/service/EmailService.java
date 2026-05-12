package ro.utcn.travelpoints.travelpoints_backend.contact.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String adminEmail;

    public void sendEmailToAdmin(String touristEmail, String subject, String message) {
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(adminEmail);
        mailMessage.setReplyTo(touristEmail); // permite adminului sa dea reply direct turistului
        mailMessage.setSubject("TravelPoints Contact: " + subject);

        String finalMessage = "Mesaj primit de la turistul: " + touristEmail + "\n\n" + message;
        mailMessage.setText(finalMessage);

        mailSender.send(mailMessage);
        log.info("Email trimis catre admin de la {}", touristEmail);
    }

    public void sendPasswordResetEmail(String to, String token) {
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(to);
        mailMessage.setSubject("Resetare parola TravelPoints");
        String resetUrl = "http://localhost:5173/reset-password?token=" + token;
        mailMessage.setText("Acceseaza acest link pentru a-ti reseta parola: \n" + resetUrl);
        mailSender.send(mailMessage);
    }

}