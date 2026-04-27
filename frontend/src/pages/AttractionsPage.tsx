import { Button, Card, Container, ListGroup, Modal, Spinner } from "react-bootstrap";
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

export default function AttractionsPage() {
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [attractionToEdit, setAttractionToEdit] = useState<AttractionType | null>(null);

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
            <ListGroup>
                {attractions.map((attraction, index) => (
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