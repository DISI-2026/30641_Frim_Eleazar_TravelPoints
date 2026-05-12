import { Form, Button, Alert } from "react-bootstrap";
import { useState } from "react";
import { forgotPassword } from "../API/auth_api";
import './LogIn.css';

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await forgotPassword(email);
        if (res.success) {
            setMessage("Daca adresa exista in sistem, vei primi un email cu instructiuni pentru resetare.");
        } else {
            setMessage("A aparut o eroare. Incearca din nou.");
        }
    };

    return (
        <div className='login-section'>
            <div className='login-overlay'></div>
            <div className='login-content'>
                <div className='login-form-wrapper'>
                    <h1 className='login-title'>Resetare Parola</h1>
                    <p className='login-subtitle'>Introdu adresa de email contului tau</p>

                    {message && <Alert variant="info">{message}</Alert>}

                    <Form onSubmit={handleSubmit} className='login-form'>
                        <Form.Group className="mb-3">
                            <Form.Label className='form-label'>Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="ion@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className='form-input'
                            />
                        </Form.Group>
                        <Button type="submit" className='btn-orange btn-glow w-100'>
                            Trimite link de resetare
                        </Button>
                    </Form>
                    <p className='login-footer'>
                        Ti-ai amintit parola? <a href="/login" className='login-link'>Conecteaza-te</a>
                    </p>
                </div>
            </div>
        </div>
    );
}