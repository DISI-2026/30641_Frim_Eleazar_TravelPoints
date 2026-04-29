
import { Form, Button } from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import './LogIn.css'
import { useLogin } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const validationSchema = Yup.object().shape({
    email: Yup.string()
        .required("Va rugam introduceti email-ul"),
    password: Yup.string()
        .required("Va rugam introduceti parola"),
});

export default function LogIn() {
    const { loginFn } = useLogin();
    const navigate = useNavigate();

    const onSubmit = async (values: { email: string; password: string }) => {
        const response = await loginFn(values.email, values.password)
        if (response !== true)
        {
            alert(response)
        }

        navigate("/login")
    }

    return (
        <div className='login-section'>
            <div className='login-overlay'></div>
            <div className='login-content'>
                <div className='login-form-wrapper'>
                    <h1 className='login-title'>Conecteaza-te</h1>
                    <p className='login-subtitle'>Bun revenire pe TravelPoints</p>

                    <Formik
                        initialValues={{
                            email: "",
                            password: "",
                        }}
                        validationSchema={validationSchema}
                        onSubmit={onSubmit}
                    >
                        {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
                            <Form onSubmit={handleSubmit} className='login-form'>
                                <Form.Group className="mb-3">
                                    <Form.Label className='form-label'>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        placeholder="ion@example.com"
                                        value={values.email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        isInvalid={touched.email && !!errors.email}
                                        className='form-input'
                                    />
                                    <Form.Control.Feedback type="invalid" className='error-text'>
                                        {errors.email}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className='form-label'>Parola</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        value={values.password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        isInvalid={touched.password && !!errors.password}
                                        className='form-input'
                                    />
                                    <Form.Control.Feedback type="invalid" className='error-text'>
                                        {errors.password}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Button
                                    type="submit"
                                    className='btn-orange btn-glow w-100'
                                >
                                    Conecteaza-te
                                </Button>
                            </Form>
                        )}
                    </Formik>

                    <p className='login-footer'>
                        Nu ai cont? <a href="/register" className='login-link'>Creeaza-l acum</a>
                    </p>
                </div>
            </div>
        </div>
    )
}