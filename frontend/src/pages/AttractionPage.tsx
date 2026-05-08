import { useParams } from 'react-router-dom';
import { addReview, getAttractions, getReviews } from '../API/attraction_api';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Container, Form, ListGroup, Modal } from 'react-bootstrap';
import { useState } from 'react';
import { useLogin } from '../context/AuthContext';
import Analytics from './Analytics';

const AttractionPage = () => {
    const { id } = useParams();
    const { isLoggedIn } = useLogin()
    const [formOpen, setFormOpen] = useState(false);
    const [recenzie, setRecenzie] = useState("");

    const { data: attraction, isError, error, isLoading } = useQuery({
        queryKey: ["attraction", id],
        queryFn: () => getAttractions().then((res) => {
            if (res.success === false) {
                throw new Error(res.error)
            }
            return res.data.findLast((attr) => String(attr.id) === String(id))
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
            <Card.Body>
                <Analytics attraction_id={attraction.id!} />
            </Card.Body>

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
        </Container >
    )
};

export default AttractionPage;