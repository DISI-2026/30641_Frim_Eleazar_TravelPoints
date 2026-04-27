import { Button, Card, Container, Form, ListGroup, Modal, Spinner } from "react-bootstrap";
import { deleteAttraction, getAttractions, updateAttraction, type AttractionType } from '../API/attraction_api';
import { useQuery } from '@tanstack/react-query';
import { useState } from "react";
import { AttractionForm } from "./NewAttraction";
import './AttractionsPage.css'

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

    if (isLoading) {
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
        if(!attractionToEdit) {
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

    return (
        <Container>
            <DeleteModal show={confirmDelete} onHide={() => setConfirmDelete(false)} onConfirm={handleConfirmDelete} />
            {attractionToEdit &&
                <Modal contentClassName="clear-modal-body" show onHide={() => setAttractionToEdit(null)}><AttractionForm isEditing initialValues={attractionToEdit} onSubmitFunc={onSubmitHandler} /></Modal>
            }

            <h1>Atracții</h1>
            <Button className="btn-orange btn-slim" href="/newattraction">Creeza o noua atractie</Button>
            
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
                                <Card.Title>{attraction.name}</Card.Title>
                                <Card.Text>{attraction.description}</Card.Text>
                                <Card.Text>{attraction.location}</Card.Text>
                                {attraction.audioFile && <audio controls src={URL.createObjectURL(attraction.audioFile)} />}
                                <Button onClick={() => setAttractionToEdit(attraction)}>Edit</Button>
                                <Button variant="danger" onClick={() => { setAttractionToEdit(attraction); setConfirmDelete(true) }}>Delete</Button>
                            </Card.Body>
                        </Card>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </Container>
    );
}