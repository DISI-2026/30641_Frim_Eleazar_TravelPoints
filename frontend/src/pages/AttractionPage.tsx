import { useParams } from 'react-router-dom';
import { addReview, getAttractionById, getReviews } from '../API/attraction_api';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Container, Form, ListGroup, Modal } from 'react-bootstrap';
import { useState } from 'react';
import { useLogin } from '../context/AuthContext';
import Analytics from './Analytics';
import { sendContactEmail } from '../API/contact_api';

const AttractionPage = () => {
    const { id } = useParams();
    const { isLoggedIn,role } = useLogin()
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
            alert("Mesaj trimis cu succes catre administrator!");
            setContactMessage("");
        }
    };

    const { data: attraction, isError, error, isLoading } = useQuery({
        queryKey: ["attraction", id],
        queryFn: () => getAttractionById(id!).then((res) => {
            if (res.success === false) {
                throw new Error(res.error)
            }
            return res.data;
        })
    });

    const {data: reviews} = useQuery({
        queryKey: ["reviews", id],
        refetchInterval: 1000,
        queryFn: () => getReviews(attraction!).then((res) => {
            if (res.success === false) {
                throw new Error(res.error)
            }
            return res.data
        }),
        enabled: attraction !== undefined
    })

    if (attraction === undefined) {
        return (
            <>
                <h2>Atractia nu a fost gasita</h2>
                <Button href="/">Inapoi la pagina principala</Button>
            </>
        )
    }

    if(reviews === undefined) {
        return (
            <>
                <h2>Recenziile nu au fost gasite</h2>
                <Button href="/">Inapoi la pagina principala</Button>
            </>
        )
    }

    if (isError) {
        return <h2>{error.message}</h2>
    }

    if (isLoading) {
        return <h2>Se incarca...</h2>
    }

    const handleNewReview = async () => {
        setFormOpen(false)
        await addReview(attraction, recenzie).then((res) => {
            if (res.success === false) {
                alert(res.error)
            } else {
                alert("Recenzie adaugata cu succes")
            }
        })
    }

    return (
        <Container>
            <Card.Title>{attraction.name}</Card.Title>
            <Card.Text>{attraction.description}</Card.Text>
            <Card.Text>{attraction.location}</Card.Text>
            {attraction.audioFile && (
                <audio
                    controls
                    src={`http://localhost:8080/api/${attraction.audioFile}`}
                    className="w-100 mb-3"
                />
            )}
            {
            role === 'ROLE_ADMIN' && (
            <Card.Body>
                <Analytics attraction_id={attraction.id!} />
            </Card.Body>
            )}

            {
                isLoggedIn &&
                <>
                    <Button variant="primary" onClick={() => setFormOpen(true)}>
                        Adauga o recenzie
                    </Button>
                    <Modal show={formOpen} onHide={() => setFormOpen(false)}>
                        <Modal.Header>
                            <Modal.Title>Adauga o recenzie</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form onSubmit={handleNewReview} className="new-attraction-form">
                                <Form.Group className="mb-3">
                                    <Form.Label className="form-label">Recenzie</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="text"
                                        placeholder="Recenzie"
                                        value={recenzie}
                                        onChange={e => setRecenzie(e.target.value)}
                                    />
                                </Form.Group>
                            </Form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setFormOpen(false)}>
                                Inchide
                            </Button>
                            <Button variant="primary" onClick={handleNewReview}>
                                Salveaza
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </>
            }

            {reviews.length > 0 ?
                (
                    reviews.map((review, index) =>
                        <ListGroup.Item key={index}>
                            <Card>
                                <Card.Body>
                                    <Card.Title>{review.author}</Card.Title>
                                    <Card.Text>{review.text}</Card.Text>
                                </Card.Body>
                            </Card>
                        </ListGroup.Item>
                    )
                )
                :
                <h3>Nu exista recenzii pentru aceasta atractie</h3>
            }
            {
                isLoggedIn && role === 'ROLE_TOURIST' &&
                <>
                    <Button variant="outline-primary" className="ms-2" onClick={() => setContactModalOpen(true)}>
                        Contacteaza Admin
                    </Button>
                    <Modal show={contactModalOpen} onHide={() => setContactModalOpen(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Contacteaza Administratorul</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>Subiect</Form.Label>
                                    <Form.Control type="text" value={`Despre ${attraction.name}`} disabled />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Mesaj</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        placeholder="Scrie intrebarea sau sugestia de modificare..."
                                        value={contactMessage}
                                        onChange={e => setContactMessage(e.target.value)}
                                    />
                                </Form.Group>
                            </Form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setContactModalOpen(false)}>
                                Anuleaza
                            </Button>
                            <Button variant="primary" onClick={handleContactAdmin} disabled={contactMessage.trim() === ""}>
                                Trimite Email
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </>
            }
        </Container >
    )
};

export default AttractionPage;