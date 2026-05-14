package ro.utcn.travelpoints.travelpoints_backend.notification.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import ro.utcn.travelpoints.travelpoints_backend.attraction.entity.Attraction;
import ro.utcn.travelpoints.travelpoints_backend.notification.dto.OfferNotificationPayload;
import ro.utcn.travelpoints.travelpoints_backend.wishlist.entity.Wishlist;
import ro.utcn.travelpoints.travelpoints_backend.wishlist.repository.WishlistRepository;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Mentine conexiunile SSE per utilizator (cheie = email) si trimite notificari
 * de tip "Oferte actualizate". Filtreaza clientii conectati astfel incat sa primeasca
 * push-ul DOAR utilizatorii care au atractia respectiva salvata in lista de favorite/wishlist.
 *
 * Folosim email-ul (citit direct din JWT) ca cheie in loc de UUID ca sa evitam un lookup
 * suplimentar in baza de date la fiecare conectare SSE — altfel, cu open-in-view, conexiunea
 * JDBC ar fi tinuta deschisa pe toata durata stream-ului (30 min) si pool-ul s-ar epuiza.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationDispatcherService {

    private static final long SSE_TIMEOUT_MS = 30L * 60L * 1000L; // 30 minute

    private final WishlistRepository wishlistRepository;

    /** Mapare email -> lista de emitter-e active (un user poate avea mai multe tab-uri). */
    private final Map<String, List<SseEmitter>> userEmitters = new ConcurrentHashMap<>();

    /**
     * Inregistreaza un nou client SSE pentru utilizatorul cu email-ul dat.
     */
    public SseEmitter register(String email) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MS);

        userEmitters.computeIfAbsent(email, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(email, emitter));
        emitter.onTimeout(() -> {
            emitter.complete();
            removeEmitter(email, emitter);
        });
        emitter.onError(ex -> {
            log.debug("SSE emitter error for user {}: {}", email, ex.getMessage());
            removeEmitter(email, emitter);
        });

        log.info("SSE emitter registered for user {} (total active: {})",
                email, userEmitters.get(email).size());
        return emitter;
    }

    /**
     * Trimite o notificare cu privire la actualizarea ofertei,
     * STRICT catre utilizatorii care au atractia in wishlist.
     */
    public void dispatchOfferUpdate(Attraction attraction) {
        List<Wishlist> wishlists = wishlistRepository.findAllByAttractionId(attraction.getId());

        if (wishlists.isEmpty()) {
            log.info("Offer updated for attraction {} but no users have it in wishlist", attraction.getId());
            return;
        }

        OfferNotificationPayload payload = new OfferNotificationPayload(
                attraction.getId(),
                "Oferta a fost actualizata pentru atractia '" + attraction.getName() + "'"
        );

        int delivered = 0;
        for (Wishlist w : wishlists) {
            String targetEmail = w.getUser().getEmail();
            List<SseEmitter> emitters = userEmitters.get(targetEmail);
            if (emitters == null || emitters.isEmpty()) {
                continue; // utilizatorul nu este conectat in acest moment
            }

            for (SseEmitter emitter : emitters) {
                try {
                    // Eveniment default ("message") - frontend-ul foloseste eventSource.onmessage
                    emitter.send(SseEmitter.event().data(payload));
                    delivered++;
                } catch (IOException e) {
                    log.debug("Failed to push to user {}: {}", targetEmail, e.getMessage());
                    removeEmitter(targetEmail, emitter);
                }
            }
        }
        log.info("Offer-update notification dispatched for attraction {} -> {} live deliveries (out of {} interested users)",
                attraction.getId(), delivered, wishlists.size());
    }

    private void removeEmitter(String email, SseEmitter emitter) {
        List<SseEmitter> list = userEmitters.get(email);
        if (list != null) {
            list.remove(emitter);
            if (list.isEmpty()) {
                userEmitters.remove(email);
            }
        }
    }
}
