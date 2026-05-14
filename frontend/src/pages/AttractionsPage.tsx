import { Button, ButtonGroup, Card, Col, Container, Form, Modal, Row, Spinner, ToggleButton } from "react-bootstrap";
import { deleteAttraction, getAttractions, updateAttraction, type AttractionType } from '../API/attraction_api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from "react";
import { AttractionForm } from "./NewAttraction";
import './AttractionsPage.css'
import { addWishlist, getWishlists, removeWishlist } from "../API/wishlist_api";
import { FaHeart, FaMapMarkerAlt, FaRegHeart, FaTag, FaTrash, FaEdit } from "react-icons/fa";
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
            <Modal.Title>Confirmare ștergere</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            Ești sigur că dorești să ștergi această atracție? Această acțiune este ireversibilă.
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={onHide} className="rounded-pill px-4">
                Anulează
            </Button>
            <Button variant="danger" onClick={onConfirm} className="rounded-pill px-4">
                Șterge
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
    const { isLoggedIn, role } = useLogin()
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

    if (isLoading || (isLoggedIn && isWishlistLoading)) {
        return (
            <div className="text-center mt-5 py-5">
                <Spinner animation="border" variant="warning" />
                <p className="mt-2 text-muted">Se încarcă atracțiile...</p>
            </div>
        )
    }

    if (isError) {
        return (
            <Container className="mt-5 text-center">
                <h2 className="text-danger">Eroare: {error.message}</h2>
                <Button onClick={() => window.location.reload()} variant="outline-primary" className="mt-3">Reîncearcă</Button>
            </Container>
        )
    }

    if (attractions === undefined || attractions.length === 0) {
        return (
            <Container className="mt-5 text-center">
                <h2>Nu am găsit atracții</h2>
                <Button href="/newattraction" className="btn-orange mt-3">Adaugă prima atracție</Button>
            </Container>
        )
    }

    const handleConfirmDelete = async () => {
        if (!attractionToEdit) return;
        await deleteAttraction(attractionToEdit).then((res) => {
            if (res.success) {
                setConfirmDelete(false);
                setAttractionToEdit(null);
                queryClient.invalidateQueries({ queryKey: ["attractions"] });
            } else {
                alert(res.error);
            }
        }).catch((err) => {
            alert((err instanceof Error ? err.message : "Unknown error"));
        });
    }

    const onSubmitHandler = async (values: AttractionType) => {
        if (!attractionToEdit) return;
        await updateAttraction(values).then((res) => {
            if (res.success) {
                setAttractionToEdit(null);
                queryClient.invalidateQueries({ queryKey: ["attractions"] });
            } else {
                alert(res.error);
            }
        }).catch((err) => {
            alert((err instanceof Error ? err.message : "Unknown error"));
        });
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

    return (
        <Container className="attractions-container">
            <DeleteModal show={confirmDelete} onHide={() => { setAttractionToEdit(null); setConfirmDelete(false) }} onConfirm={handleConfirmDelete} />
            {attractionToEdit && !confirmDelete &&
                <Modal contentClassName="clear-modal-body" show onHide={() => setAttractionToEdit(null)} centered>
                    <AttractionForm isEditing initialValues={attractionToEdit} onSubmitFunc={onSubmitHandler} />
                </Modal>
            }

            <div className="d-flex justify-content-between align-items-end mb-5">
                <div>
                    <h1 className="attractions-title mb-0">Explorează Atracții</h1>
                    <p className="text-muted mt-2">Descoperă cele mai frumoase locuri și planifică-ți următoarea aventură.</p>
                </div>
                {role === 'ROLE_ADMIN' && (
                    <Button className="btn-orange rounded-pill px-4 py-2 fw-bold shadow-sm" href="/newattraction">
                        + Atracție Nouă
                    </Button>
                )}
            </div>

            {isWishlistError && <div className="alert alert-danger mb-4">{wishlistError instanceof Error ? wishlistError.message : "Eroare la încărcarea wishlist-ului"}</div>}

            <div className="filter-section mb-5">
                <Form className="row g-3">
                    <Col md={4}>
                        <Form.Label className="filter-label">Caută după nume</Form.Label>
                        <Form.Control
                            className="filter-input"
                            type="text"
                            placeholder="Ex: Castelul Bran..."
                            value={attractionFilter.name}
                            onChange={(e) => setAttractionFilter({ ...attractionFilter, name: e.target.value })}
                        />
                    </Col>
                    <Col md={4}>
                        <Form.Label className="filter-label">Locație</Form.Label>
                        <Form.Select
                            className="filter-input"
                            value={attractionFilter.location}
                            onChange={(e) => setAttractionFilter({ ...attractionFilter, location: e.target.value })}
                        >
                            <option value="">Toate locațiile</option>
                            {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                        </Form.Select>
                    </Col>
                    <Col md={4}>
                        <Form.Label className="filter-label">Categorie</Form.Label>
                        <Form.Select
                            className="filter-input"
                            value={attractionFilter.category}
                            onChange={(e) => setAttractionFilter({ ...attractionFilter, category: e.target.value })}
                        >
                            <option value="">Toate categoriile</option>
                            {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </Form.Select>
                    </Col>
                </Form>
            </div>

            {role === 'ROLE_ADMIN' && (
                <div className="popularity-chart-container mb-5">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="mb-0 fw-bold">Popularitate</h4>
                        <ButtonGroup className="bg-light p-1 rounded-pill shadow-sm border">
                            {[true, false].map((radio, idx) => (
                                <ToggleButton
                                    key={idx}
                                    id={`radio-${idx}`}
                                    type="radio"
                                    variant="link"
                                    className={`rounded-pill px-4 py-1 text-decoration-none border-0 ${isPopularityPieChart === radio ? 'bg-white shadow-sm text-dark fw-bold' : 'text-muted'}`}
                                    name="radio"
                                    value={radio ? "Pie" : "Bar"}
                                    checked={isPopularityPieChart === radio}
                                    onChange={(e) => setIsPopularityPieChart(e.currentTarget.value == "Pie")}
                                >
                                    {radio ? "Pie" : "Bar"}
                                </ToggleButton>
                            ))}
                        </ButtonGroup>
                    </div>
                    <PopularityChart is_pie={isPopularityPieChart} />
                </div>
            )}

            <Row xs={1} md={2} lg={3} className="g-4">
                {attractions.filter((att) => {
                    const matchName = attractionFilter.name ? att.name.toLowerCase().includes(attractionFilter.name.toLowerCase()) : true;
                    const matchLocation = attractionFilter.location ? att.location === attractionFilter.location : true;
                    const matchCategory = attractionFilter.category ? att.category === attractionFilter.category : true;
                    return matchName && matchLocation && matchCategory;
                }).map((attraction, index) => (
                    <Col key={index}>
                        <Card className="attraction-card h-100 border-0">
                            <Card.Body className="d-flex flex-column p-4">
                                {isLoggedIn && (
                                    <button
                                        onClick={() => toggleWishlist(String(attraction.id))}
                                        className={`wishlist-toggle-btn shadow-sm ${wishlists?.some((wl) => String(wl.id) === String(attraction.id)) ? 'active' : ''}`}
                                    >
                                        {wishlists?.some((wl) => String(wl.id) === String(attraction.id)) ? <FaHeart /> : <FaRegHeart />}
                                    </button>
                                )}

                                <Card.Title className="attraction-card-title fw-bold mb-3">{attraction.name}</Card.Title>

                                <div className="meta-info mb-3">
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

                                <Card.Text className="attraction-desc flex-grow-1 text-muted mb-3">
                                    {attraction.description}
                                </Card.Text>

                                {attraction.offers && (
                                    <div className="offers-tag mb-4">
                                        {attraction.offers}
                                    </div>
                                )}

                                <div className="d-flex justify-content-between align-items-center mt-auto">
                                    <div className="admin-actions">
                                        {role === 'ROLE_ADMIN' && (
                                            <>
                                                <Button variant="link" className="p-0 text-dark me-2" onClick={() => setAttractionToEdit(attraction)}>
                                                    <FaEdit size={20} />
                                                </Button>
                                                <Button variant="link" className="p-0 text-danger" onClick={() => { setAttractionToEdit(attraction); setConfirmDelete(true) }}>
                                                    <FaTrash size={18} />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                    <Button href={`/attraction/${attraction.id}`} className="btn-details-modern rounded-pill px-4">
                                        Vezi detalii
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container >
    );
}

function PopularityChart({ is_pie = true }: { is_pie: boolean }) {
    const { isLoggedIn, role } = useLogin()

    const { data: popularity, isError: isPopularityError, error: popularityError, isLoading: isPopularityLoading } = useQuery({
        queryKey: ["popularity"],
        queryFn: () => getAnalyticsPopularity().then(res => {
            if (res.success === false) {
                throw new Error(res.error)
            }
            return res.data
        }),
        enabled: isLoggedIn && role === 'ROLE_ADMIN'
    })

    if (!isLoggedIn || role !== 'ROLE_ADMIN') return undefined

    if (isPopularityLoading)
        return <div className="text-center py-4"><Spinner animation="border" variant="warning" /><p>Se încarcă datele...</p></div>

    if (isPopularityError)
        return <p className="text-danger text-center">Eroare la încărcarea datelor: {popularityError.message}</p>

    if (!popularity)
        return <p className="text-center">Nu există date disponibile pentru grafic.</p>

    const chartData = {
        labels: popularity.map((item) => item.name),
        datasets: [
            {
                label: 'Vizite',
                data: popularity.map((item) => item.views),
                borderWidth: 1,
                backgroundColor: [
                    'rgba(255, 140, 0, 0.7)',
                    'rgba(255, 174, 66, 0.7)',
                    'rgba(255, 98, 0, 0.7)',
                    'rgba(255, 193, 7, 0.7)',
                    'rgba(255, 87, 34, 0.7)',
                ],
                borderColor: [
                    'rgba(255, 140, 0, 1)',
                    'rgba(255, 174, 66, 1)',
                    'rgba(255, 98, 0, 1)',
                    'rgba(255, 193, 7, 1)',
                    'rgba(255, 87, 34, 1)',
                ],
            },
        ],
    };

    const commonOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom' as const,
            },
        },
    };

    if (is_pie)
        return (
            <div style={{ margin: '0 auto', maxWidth: '400px' }}>
                <Pie options={commonOptions} data={chartData} />
            </div>
        )

    return (
        <div style={{ height: '300px' }}>
            <Bar
                options={{
                    ...commonOptions,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { precision: 0 }
                        }
                    }
                }}
                data={chartData}
            />
        </div>
    )
}
