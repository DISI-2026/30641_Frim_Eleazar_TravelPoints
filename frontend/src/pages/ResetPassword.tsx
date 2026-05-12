import { Form, Button, Alert } from "react-bootstrap";
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../API/auth_api";
import './LogIn.css';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) {
            setError("Link invalid sau expirat.");
            return;
        }
        if (password.length < 8) {
            setError("Parola trebuie sa aiba minim 8 caractere.");
            return;
        }

        const res = await resetPassword(token, password);
        if (res.success) {
            alert("Parola a fost resetata cu succes!");
            navigate("/login");
        } else {
            setError(res.error || "A aparut o eroare.");
        }
    };

    if (!token) {
        return (
            <div className='login-section'>
                <div className='login-overlay'></div>
                <div className='login-content'>
                    <div className='login-form-wrapper'>
                        <Alert variant="danger">Nu a fost furnizat un token valid pentru resetare.</Alert>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='login-section'>
            <div className='login-overlay'></div>
            <div className='login-content'>
                <div className='login-form-wrapper'>
                    <h1 className='login-title'>Alege o noua parola</h1>

                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleSubmit} className='login-form'>
                        <Form.Group className="mb-4">
                            <Form.Label className='form-label'>Parola noua</Form.Label>
                            <Form.Control
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className='form-input'
                            />
                        </Form.Group>
                        <Button type="submit" className='btn-orange btn-glow w-100'>
                            Salveaza parola
                        </Button>
                    </Form>
                </div>
            </div>
        </div>
    );
}