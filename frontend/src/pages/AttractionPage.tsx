import { useParams } from 'react-router-dom';
import { addReview, getAttractionById, getReviews } from '../API/attraction_api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Container, Form, ListGroup, Modal, Spinner, Badge } from 'react-bootstrap';
import { useState } from 'react';
import { useLogin } from '../context/AuthContext';
import Analytics from './Analytics';
import { sendContactEmail } from '../API/contact_api';
import { FaMapMarkerAlt, FaTag, FaCommentDots, FaHeadphones, FaEnvelope, FaPlus, FaHeart, FaRegHeart } from 'react-icons/fa';
import './AttractionPage.css';
import { addWishlist, getWishlists, removeWishlist } from '../API/wishlist_api';

const AttractionPage = () => {
    const { id } = useParams();
    const { isLoggedIn, role } = useLogin()
    const queryClient = useQueryClient();
    const [formOpen, setFormOpen] = useState(false);
    const [recenzie, setRecenzie] = useState("");
    const [contactModalOpen, setContactModalOpen] = useState(false);
    const [contactMessage, setContactMessage] = useState("");

    const handleContactAdmin = async () => {
        setContactModalOpen(false);
        const subject = `Sugestie/Intrebare despre ${attraction!.name}`;
        const res = await sendContactEmail(subject, contactMessage);
        if (!res.success) {
            alert(res.error);
        } else {
            alert("Mesaj trimis cu succes către administrator!");
            setContactMessage("");
        }
    };

    const { data: attraction, isError, isLoading } = useQuery({
        queryKey: ["attraction", id],
        queryFn: () => getAttractionById(id!).then((res) => {
            if (res.success === false) {
                throw new Error(res.error)
            }
            return res.data;
        })
    });

    const { data: reviews } = useQuery({
        queryKey: ["reviews", id],
        refetchInterval: 5000,
        queryFn: () => getReviews(attraction!).then((res) => {
            if (res.success === false) {
                throw new Error(res.error)
            }
            return res.data
        }),
        enabled: attraction !== undefined
    })

    const { data: wishlists } = useQuery({
        queryKey: ["wishlists"],
        refetchInterval: 5000,
        queryFn: () => getWishlists().then((res) => {
            if (res.success === false) {
                throw new Error(res.error)
            }
            return res.data
        }),
        enabled: isLoggedIn
    })

    if (isLoading) {
        return (
            <Container className="text-center mt-5 py-5">
                <Spinner animation="border" variant="warning" />
                <p className="mt-2 text-muted">Se încarcă detaliile atracției...</p>
            </Container>
        )
    }

    if (isError || attraction === undefined) {
        return (
            <Container className="text-center mt-5 py-5">
                <h2 className="text-danger">Atractia nu a fost găsită</h2>
                <Button href="/attractions" className="btn-orange mt-3 rounded-pill px-4">Înapoi la atracții</Button>
            </Container>
        )
    }

    const toggleWishlist = async (attractionId: string) => {
        if (wishlists === undefined) return;
        const isAlreadyInWishlist = wishlists.some((wl) => String(wl.id) === String(attractionId));
        if (isAlreadyInWishlist) {
            await removeWishlist(attractionId).then((res) => {
                if (!res.success) alert(res.error);
            });
        } else {
            await addWishlist(attractionId).then((res) => {
                if (!res.success) alert(res.error);
            });
        }
        queryClient.invalidateQueries({ queryKey: ["wishlists"] });
    }

    const handleNewReview = async () => {
        if (recenzie.trim() === "") return;
        setFormOpen(false)
        await addReview(attraction, recenzie).then((res) => {
            if (res.success === false) {
                alert(res.error)
            } else {
                setRecenzie("");
            }
        })
    }

    return (
        <Container className="attraction-page-container">
            <div className="attraction-header">
                {isLoggedIn && (
                    <button
                        onClick={() => toggleWishlist(String(attraction.id))}
                        className={`wishlist-toggle-btn shadow-sm ${wishlists?.some((wl) => String(wl.id) === String(attraction.id)) ? 'active' : ''}`}
                    >
                        {wishlists?.some((wl) => String(wl.id) === String(attraction.id)) ? <FaHeart /> : <FaRegHeart />}
                    </button>
                )}
                <div className="d-flex align-items-center gap-3 flex-wrap mb-3 pe-5">
                    <h1 className="attraction-main-title m-0">{attraction.name}</h1>
                    {attraction.category && <Badge bg="warning" text="dark" className="rounded-pill px-3 py-2">{attraction.category}</Badge>}
                </div>

                <div className="meta-info mb-4">
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

                <p className="attraction-full-desc">{attraction.description}</p>

                {attraction.offers && (
                    <div className="offers-tag mb-4">
                        {attraction.offers}
                    </div>
                )}

                {attraction.audioFile && (
                    <div className="audio-container shadow-sm">
                        <div className="audio-header-info">
                            <div className="audio-icon-wrapper">
                                <FaHeadphones />
                            </div>
                            <h5 className="audio-label">Ghid Audio</h5>
                        </div>
                        <audio
                            controls
                            src={`http://localhost:8080/api/${attraction.audioFile}`}
                            className="audio-player-custom"
                        />
                    </div>
                )}

                {isLoggedIn && role === 'ROLE_TOURIST' && (
                    <div className="mt-auto pt-4">
                        <Button variant="outline-warning" className="btn-contact rounded-pill px-4 py-2" onClick={() => setContactModalOpen(true)}>
                            <FaEnvelope className="me-2" /> Contactează Administrator
                        </Button>
                    </div>
                )}
            </div>

            {role === 'ROLE_ADMIN' && (
                <div className="analytics-section">
                    <Analytics attraction_id={attraction.id!} />
                </div>
            )}

            <div className="reviews-section">
                <div className="reviews-header">
                    <h3 className="fw-bold mb-0">Recenzii <span className="text-muted small">({reviews?.length || 0})</span></h3>
                    {isLoggedIn && (
                        <Button className="btn-orange rounded-pill px-4" onClick={() => setFormOpen(true)}>
                            <FaPlus className="me-2" /> Adaugă recenzie
                        </Button>
                    )}
                </div>

                {reviews && reviews.length > 0 ? (
                    <ListGroup className="border-0">
                        {reviews.map((review, index) => (
                            <ListGroup.Item key={index} className="border-0 p-0 mb-3">
                                <Card className="review-card">
                                    <Card.Body className="p-4">
                                        <div className="d-flex align-items-center mb-2">
                                            <div className="bg-light rounded-circle p-2 me-3">
                                                <FaCommentDots className="text-muted" />
                                            </div>
                                            <Card.Title className="review-author mb-0">{review.author}</Card.Title>
                                        </div>
                                        <Card.Text className="review-text ms-5">{review.text}</Card.Text>
                                    </Card.Body>
                                </Card>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                ) : (
                    <div className="text-center py-5 bg-light rounded-4">
                        <FaCommentDots size={40} className="text-muted mb-3" />
                        <p className="text-muted">Nu există recenzii pentru această atracție încă. Fii primul care adaugă una!</p>
                    </div>
                )}
            </div>

            {/* Modals */}
            <Modal show={formOpen} onHide={() => setFormOpen(false)} centered className="modern-modal">
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold">Adaugă o recenzie</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label className="filter-label">Experiența ta</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            className="filter-input"
                            placeholder="Spune-ne ce ți-a plăcut la această locație..."
                            value={recenzie}
                            onChange={e => setRecenzie(e.target.value)}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="link" className="text-muted text-decoration-none" onClick={() => setFormOpen(false)}>
                        Anulează
                    </Button>
                    <Button className="btn-orange rounded-pill px-4" onClick={handleNewReview}>
                        Postează recenzia
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={contactModalOpen} onHide={() => setContactModalOpen(false)} centered className="modern-modal">
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold">Contactează Administratorul</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label className="filter-label">Subiect</Form.Label>
                        <Form.Control type="text" className="filter-input" value={`Despre ${attraction.name}`} disabled />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="filter-label">Mesajul tău</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            className="filter-input"
                            placeholder="Scrie întrebarea sau sugestia de modificare..."
                            value={contactMessage}
                            onChange={e => setContactMessage(e.target.value)}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="link" className="text-muted text-decoration-none" onClick={() => setContactModalOpen(false)}>
                        Anulează
                    </Button>
                    <Button className="btn-orange rounded-pill px-4" onClick={handleContactAdmin} disabled={contactMessage.trim() === ""}>
                        Trimite Email
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container >
    )
};

export default AttractionPage;