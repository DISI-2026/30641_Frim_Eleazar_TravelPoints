import { Button, ButtonGroup, Card, Container, Form, ListGroup, Modal, Spinner, ToggleButton } from "react-bootstrap";
import { deleteAttraction, getAttractions, updateAttraction, type AttractionType } from '../API/attraction_api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from "react";
import { AttractionForm } from "./NewAttraction";
import './AttractionsPage.css'
import { addWishlist, getWishlists, removeWishlist } from "../API/wishlist_api";
import { FaExternalLinkAlt, FaHeart, FaRegHeart } from "react-icons/fa";
import { useLogin } from "../context/AuthContext";
import { getAnalyticsPopularity } from "../API/analytics_api";
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

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

type AttractionFilter = {
    location: string,
    name: string,
    category: string
}


export default function AttractionsPage() {
    const { isLoggedIn,role } = useLogin()
    const queryClient = useQueryClient();
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [attractionToEdit, setAttractionToEdit] = useState<AttractionType | null>(null);
    const [attractionFilter, setAttractionFilter] = useState<AttractionFilter>({ location: "", name: "", category: "" });
    const [isPopularityPieChart, setIsPopularityPieChart] = useState(true)



    const { data: attractions, isError, error, isLoading } = useQuery({
        queryKey: ["attractions"],
        queryFn: () => getAttractions().then((res) => {
            if (res.success === false) {
                throw new Error(res.error)
            }
            return res.data
        })
    });
    const uniqueLocations = Array.from(new Set(attractions?.map(a => a.location))).filter(Boolean);
    const uniqueCategories = Array.from(new Set(attractions?.map(a => a.category))).filter(Boolean);

    const { data: wishlists, error: wishlistError, isError: isWishlistError, isLoading: isWishlistLoading } = useQuery({
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

    // Afisam spinner-ul cat timp se incarca datele
    if (isLoading || (isLoggedIn && isWishlistLoading)) {
        return (
            <div className="text-center mt-5">
                <Spinner animation="border" />
            </div>
        )
    }

    // Apoi verificam daca a aparut o eroare de la server
    if (isError) {
        return (
            <h2>Eroare: {error.message}</h2>
        )
    }

    // La final, daca incarcarea a terminat dar lista tot e goala
    if (attractions === undefined || attractions.length === 0) {
        return (
            <h2>Nu am gasit atractii</h2>
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

    const toggleWishlist = async (attractionId: string) => {
        if (wishlists === undefined) {
            return
        }

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

        // <-- SOLUTIA: Spunem React Query sa faca refetch instant la wishlist
        queryClient.invalidateQueries({ queryKey: ["wishlists"] });
    }

    return (
        <Container>
            <DeleteModal show={confirmDelete} onHide={() => { setAttractionToEdit(null); setConfirmDelete(false) }} onConfirm={handleConfirmDelete} />
            {attractionToEdit && !confirmDelete &&
                <Modal contentClassName="clear-modal-body" show onHide={() => setAttractionToEdit(null)}><AttractionForm isEditing initialValues={attractionToEdit} onSubmitFunc={onSubmitHandler} /></Modal>
            }

            <h1>Atracții</h1>
            {role === 'ROLE_ADMIN' && (
                <Button className="btn-orange btn-slim" href="/newattraction">Creeza o noua atractie</Button>
            )}

            {isWishlistError && <h2>{wishlistError instanceof Error ? wishlistError.message : "Eroare la incarcarea wishlists"}</h2>}

            <Form className="row mb-4">
                <Form.Group className="col-md-4 mb-3" controlId="attractionName">
                    <Form.Label>Cauta dupa nume</Form.Label>
                    <Form.Control type="text" placeholder="Numele atractiei"
                        value={attractionFilter.name}
                        onChange={(e) => setAttractionFilter({ ...attractionFilter, name: e.target.value })}
                    />
                </Form.Group>

                <Form.Group className="col-md-4 mb-3" controlId="location">
                    <Form.Label>Filtreaza dupa locatie</Form.Label>
                    <Form.Select
                        value={attractionFilter.location}
                        onChange={(e) => setAttractionFilter({ ...attractionFilter, location: e.target.value })}
                    >
                        <option value="">Toate locatiile</option>
                        {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                    </Form.Select>
                </Form.Group>

                <Form.Group className="col-md-4 mb-3" controlId="category">
                    <Form.Label>Filtreaza dupa categorie</Form.Label>
                    <Form.Select
                        value={attractionFilter.category}
                        onChange={(e) => setAttractionFilter({ ...attractionFilter, category: e.target.value })}
                    >
                        <option value="">Toate categoriile</option>
                        {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </Form.Select>
                </Form.Group>
            </Form>

            {role === 'ROLE_ADMIN' && (
                <>
                    <ButtonGroup>
                        {[true, false].map((radio, idx) => (
                            <ToggleButton
                                key={idx}
                                id={`radio-${idx}`}
                                type="radio"
                                variant={idx % 2 ? 'outline-primary' : 'outline-success'}
                                name="radio"
                                value={radio ? "Pie" : "Chart"}
                                checked={isPopularityPieChart === radio}
                                onChange={(e) => setIsPopularityPieChart(e.currentTarget.value == "Pie")}
                            >
                                {radio ? "Pie" : "Chart"}
                            </ToggleButton>
                        ))}
                    </ButtonGroup>
                    <PopularityChart is_pie={isPopularityPieChart} />
                </>
            )}

            <ListGroup>
                {attractions.filter((att) => {
                    const matchName = attractionFilter.name ? att.name.toLowerCase().includes(attractionFilter.name.toLowerCase()) : true;
                    const matchLocation = attractionFilter.location ? att.location === attractionFilter.location : true;
                    const matchCategory = attractionFilter.category ? att.category === attractionFilter.category : true;
                    return matchName && matchLocation && matchCategory;
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
                                {attraction.entryPrice !== undefined && attraction.entryPrice !== null && (
                                    <Card.Text>
                                        <strong>Pret: </strong>{attraction.entryPrice} RON
                                    </Card.Text>
                                )}
                                {attraction.offers && (
                                    <Card.Text>
                                        <strong>Oferte: </strong>{attraction.offers}
                                    </Card.Text>
                                )}


                                {role === 'ROLE_ADMIN' && (
                                    <>
                                        <Button variant="text" className="btn-orange mx-3 py-2 rounded-pill" onClick={() => setAttractionToEdit(attraction)}>Edit</Button>
                                        <Button variant="danger" className="btn-slim" onClick={() => { setAttractionToEdit(attraction); setConfirmDelete(true) }}>Delete</Button>
                                    </>
                                )}

                                {role === 'ROLE_TOURIST' && isLoggedIn && wishlists !== undefined && (
                                        <Button
                                            onClick={() => toggleWishlist(String(attraction.id))}
                                            variant="text"
                                            className="btn-glow btn-slim p-2 rounded-5 py-1 m-2"
                                        >
                                            {wishlists.some((wl) => String(wl.id) === String(attraction.id)) ? (
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

function PopularityChart({ is_pie = true }: { is_pie: boolean }) {
    const { isLoggedIn,role } = useLogin()

    const { data: popularity, isError: isPopularityError, error: popularityError, isLoading: isPopularityLoading } = useQuery({
        queryKey: ["popularity"],
        queryFn: () => getAnalyticsPopularity().then(res => {
            if (res.success === false) {
                throw new Error(res.error)
            }
            return res.data
        }),
        enabled: isLoggedIn&& role === 'ROLE_ADMIN'
    })

    if (!isLoggedIn|| role !== 'ROLE_ADMIN') return undefined

    if (isPopularityLoading)
        return <>
            Incarcare detalii popularitate <Spinner />
        </>

    if (isPopularityError)
        return <p>Eroare la gasirea popularitatii atractiilor: {popularityError.message}</p>

    if (!popularity)
        return <p>Eroare la gasirea popularitatii atractiilor</p>

    if (is_pie)
        return (<div style={{ marginTop: '20px', width: '50%' }}>
            <Pie options={{
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom' as const,
                    },
                    title: {
                        display: true,
                        text: 'Popularitatea atractiilor',
                    },
                },
            }}
                data={{
                    labels: popularity.map((item) => item.name),
                    datasets: [
                        {
                            label: 'Vizite',
                            data: popularity.map((item) => item.views),
                            borderWidth: 1,
                            backgroundColor: [
                                'rgba(54, 162, 235, 0.8)',
                                'rgba(75, 192, 192, 0.8)',
                                'rgba(255, 206, 86, 0.8)',
                                'rgba(153, 102, 255, 0.8)',
                            ],
                            borderColor: [
                                'rgba(54, 162, 235, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(153, 102, 255, 1)',
                            ],
                        },
                    ],
                }}
            /> </div>)

    return (
        <Bar options={{
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom' as const,
                },
                title: {
                    display: true,
                    text: 'Popularitatea atractiilor',
                },
            },
        }}
            data={{
                labels: popularity.map((item) => item.name),
                datasets: [
                    {
                        label: 'Vizite',
                        data: popularity.map((item) => item.views),
                        backgroundColor: 'rgba(54, 162, 235, 0.8)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1,
                    },
                ],
            }}
        />
    )
}