import { Button, Card, Container, Form, ListGroup, Modal, Spinner } from "react-bootstrap";
import { deleteAttraction, getAttractions, updateAttraction, type AttractionType } from '../API/attraction_api';
import { useQuery } from '@tanstack/react-query';
import { useState } from "react";
import { AttractionForm } from "./NewAttraction";
import './AttractionsPage.css'
import { addWishlist, getWishlists, removeWishlist } from "../API/wishlist_api";
import { FaExternalLinkAlt, FaHeart, FaRegHeart } from "react-icons/fa";
import { useLogin } from "../context/AuthContext";

const DeleteModal = ({ show, onHide, onConfirm }: { show: boolean; onHide: () => void; onConfirm: () => void }) => (
    <Modal show={show} onHide={onHide} centered>
        <Modal.Header closeButton>
            <Modal.Title>Confirm</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            Esti sigur ca doresti sa stergi aceasta atractie?
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={onHide}>
                Cancel
            </Button>
            <Button variant="danger" onClick={onConfirm}>
                Delete
            </Button>
        </Modal.Footer>
    </Modal>
);

type LocationFilterType = "Italia" | "Romania" | "Franta" | "Spania" | undefined
type AttractionFilter = {
    location: LocationFilterType,
    name: string
}

export default function AttractionsPage() {
    const { isLoggedIn } = useLogin()
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [attractionToEdit, setAttractionToEdit] = useState<AttractionType | null>(null);
    const [attractionFilter, setAttractionFilter] = useState<AttractionFilter>({ location: undefined, name: "" });

    const { data: attractions, isError, error, isLoading } = useQuery({
        queryKey: ["attractions"],
        queryFn: () => getAttractions().then((res) => {
            if (res.success === false) {
                throw new Error(res.error)
            }
            return res.data
        })
    });

    const { data: wishlists, error: wishlistError, isError: isWishlistError, isLoading: isWishlistLoading } = useQuery({
        queryKey: ["wishlists"],
        refetchInterval: 5000,
        queryFn: () => getWishlists().then((res) => {
            if (res.success === false) {
                throw new Error(res.error)
            }
            return res.data
        })
    })

    if (attractions === undefined) {
        return (
            <h2>Nu am gasit atractii</h2>
        )
    }

    if (isError) {
        return (
            <h2>{error.message}</h2>
        )
    }

    if (isLoading || isWishlistLoading) {
        return (
            <Spinner />
        )
    }

    const handleConfirmDelete = async () => {
        if (!attractionToEdit) {
            console.error("No attraction selected for deletion");
            return;
        }
        await deleteAttraction(attractionToEdit).then((res) => {
            if (res.success) {
                setConfirmDelete(false);
                setAttractionToEdit(null);
            } else {
                alert(res.error);
            }
        }).catch((err) => {
            alert((err instanceof Error ? err.message : "Unknown error"));
        });
    }

    const onSubmitHandler = async (values: AttractionType) => {
        if (!attractionToEdit) {
            console.error("No attraction selected for update");
            return;
        }
        await updateAttraction(values).then((res) => {
            if (res.success) {
                setAttractionToEdit(null);
            } else {
                alert(res.error);
            }
        }).catch((err) => {
            alert((err instanceof Error ? err.message : "Unknown error"));
        });
    }

    const toggleWishlist = async (attractionId: number) => {
        if (wishlists === undefined) {
            return
        }

        if (wishlists.some((wl) => wl.id === attractionId)) {
            await removeWishlist(attractionId).then((res) => {
                if (!res.success) {
                    alert(res.error)
                }
            })
            return
        }

        await addWishlist(attractionId).then((res) => {
            if (!res.success) {
                alert(res.error)
            }
        })
    }

    return (
        <Container>
            <DeleteModal show={confirmDelete} onHide={() => { setAttractionToEdit(null); setConfirmDelete(false) }} onConfirm={handleConfirmDelete} />
            {attractionToEdit && !confirmDelete &&
                <Modal contentClassName="clear-modal-body" show onHide={() => setAttractionToEdit(null)}><AttractionForm isEditing initialValues={attractionToEdit} onSubmitFunc={onSubmitHandler} /></Modal>
            }

            <h1>Atracții</h1>
            <Button className="btn-orange btn-slim" href="/newattraction">Creeza o noua atractie</Button>

            {isWishlistError && <h2>{wishlistError instanceof Error ? wishlistError.message : "Eroare la incarcarea wishlists"}</h2>}

            <Form>
                <Form.Group className="mb-3" controlId="attractionName">
                    <Form.Label>Caută după nume</Form.Label>
                    <Form.Control type="text" placeholder="Numele atractiei"
                        defaultValue={attractionFilter.name}
                        onChange={(e) => {
                            setAttractionFilter({ ...attractionFilter, name: e.target.value })
                        }}
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="location">
                    <Form.Label>Filtrează după locație</Form.Label>
                    <Form.Select aria-label="Default select example"
                        defaultValue={attractionFilter.location}
                        onChange={(e) => {
                            const val = e.target.value as LocationFilterType
                            setAttractionFilter({ ...attractionFilter, location: val })
                        }}
                    >
                        <option value="">Selectează o locație</option>
                        <option value="Italia">Italia</option>
                        <option value="Romania">Romania</option>
                        <option value="Franta">Franta</option>
                        <option value="Spania">Spania</option>
                    </Form.Select>
                </Form.Group>
            </Form>

            <ListGroup>
                {attractions.filter((att) => {
                    return (
                        (attractionFilter.name ? att.name.toLowerCase().includes(attractionFilter.name.toLowerCase()) : true) &&
                        (attractionFilter.location ? att.location === attractionFilter.location : true)
                    );
                }).map((attraction, index) => (
                    <ListGroup.Item key={index}>
                        <Card>
                            <Card.Body>
                                <Card.Title>{attraction.name}
                                    <Button href={`/attraction/${attraction.id}`} variant="outline">
                                        <FaExternalLinkAlt />
                                    </Button>
                                </Card.Title>
                                <Card.Text>{attraction.description}</Card.Text>
                                <Card.Text>{attraction.location}</Card.Text>
                                {attraction.audioFile && <audio controls src={URL.createObjectURL(attraction.audioFile)} />}

                                <Button variant="text" className="btn-orange mx-3 py-2 rounded-pill" onClick={() => setAttractionToEdit(attraction)}>Edit</Button>
                                <Button variant="danger" className="btn-slim" onClick={() => { setAttractionToEdit(attraction); setConfirmDelete(true) }}>Delete</Button>

                                {(wishlists === undefined || isLoggedIn == false) ?
                                    <Button href="/login" variant="text" className="btn-glow btn-slim p-2 rounded-5 py-1 m-2">
                                        <FaRegHeart />
                                    </Button>
                                    :
                                    (
                                        <Button
                                            onClick={() => toggleWishlist(attraction.id!)}
                                            variant="text" className="btn-glow btn-slim p-2 rounded-5 py-1 m-2">
                                            {wishlists.some((wl) => wl.id === attraction.id) ? (
                                                <FaHeart />
                                            ) : (
                                                <FaRegHeart />
                                            )}
                                        </Button>
                                    )}
                            </Card.Body>
                        </Card>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </Container >
    );
}