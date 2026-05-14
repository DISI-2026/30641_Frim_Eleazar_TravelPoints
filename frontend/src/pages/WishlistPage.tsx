import { Container, Card, ListGroup, Button, Spinner } from "react-bootstrap";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAttractions } from "../API/attraction_api";
import { getWishlists, removeWishlist } from "../API/wishlist_api";
import { useLogin } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { FaHeart, FaMapMarkerAlt, FaTag } from "react-icons/fa";
import './WishlistPage.css';

export default function WishlistPage() {
    const { isLoggedIn } = useLogin();
    const queryClient = useQueryClient();

    const { data: attractions, isLoading: isAttractionsLoading } = useQuery({
        queryKey: ["attractions"],
        queryFn: () => getAttractions().then((res) => {
            if (res.success === false) throw new Error(res.error);
            return res.data;
        })
    });

    const { data: wishlists, isLoading: isWishlistLoading } = useQuery({
        queryKey: ["wishlists"],
        refetchInterval: 5000,
        queryFn: () => getWishlists().then((res) => {
            if (res.success === false) throw new Error(res.error);
            return res.data;
        }),
        enabled: isLoggedIn
    });

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    if (isAttractionsLoading || isWishlistLoading) {
        return (
            <div className="text-center mt-5">
                <Spinner animation="border" />
            </div>
        );
    }

    const handleRemoveWishlist = async (attractionId: string) => {
        await removeWishlist(attractionId).then((res) => {
            if (!res.success) alert(res.error);
        });
        queryClient.invalidateQueries({ queryKey: ["wishlists"] });
    };

    const wishlistedAttractions = attractions?.filter(att => 
        wishlists?.some(wl => String(wl.id) === String(att.id))
    ) || [];

    return (
        <Container className="wishlist-container mt-4">
            <h1 className="wishlist-title mb-5">Wishlist-ul Meu</h1>
            {wishlistedAttractions.length === 0 ? (
                <div className="text-center py-5">
                    <h4 className="text-muted">Nu ai adăugat nicio atracție în wishlist încă.</h4>
                    <Button href="/attractions" className="btn-orange mt-3 px-4 rounded-pill">Explorează Atracții</Button>
                </div>
            ) : (
                <ListGroup className="wishlist-grid">
                    {wishlistedAttractions.map((attraction, index) => (
                        <ListGroup.Item key={index} className="wishlist-item border-0 p-0 mb-4">
                            <Card className="wishlist-card h-100">
                                <Card.Body className="d-flex flex-column p-4">
                                    <Button 
                                        className="wishlist-heart-btn shadow-sm"
                                        onClick={() => handleRemoveWishlist(String(attraction.id))}
                                        title="Șterge din wishlist"
                                    >
                                        <FaHeart />
                                    </Button>

                                    <Card.Title className="wishlist-card-title fw-bold mb-3">
                                        {attraction.name}
                                    </Card.Title>

                                    <div className="meta-info">
                                        <div className="meta-item">
                                            <FaMapMarkerAlt className="meta-icon" />
                                            {attraction.location}
                                        </div>
                                        {attraction.entryPrice !== undefined && attraction.entryPrice !== null && (
                                            <div className="meta-item">
                                                <FaTag className="meta-icon" />
                                                {attraction.entryPrice} RON
                                            </div>
                                        )}
                                    </div>

                                    <Card.Text className="attraction-desc flex-grow-1">
                                        {attraction.description}
                                    </Card.Text>

                                    {attraction.offers && (
                                        <div className="offers-tag">
                                            {attraction.offers}
                                        </div>
                                    )}

                                    <div className="mt-4 d-flex justify-content-end">
                                        <Button href={`/attraction/${attraction.id}`} className="btn-details rounded-pill px-4">
                                            Vezi detalii
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}
        </Container>
    );
}