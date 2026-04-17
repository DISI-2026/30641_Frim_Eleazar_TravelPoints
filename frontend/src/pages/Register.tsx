import { Form, Button } from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import './Register.css'
import { useLogin } from "../context/AuthContext";

function check_mail(mail: string | undefined): boolean {
    if (!mail) {
        return false
    }

    if (mail.length < 8) {
        return false
    }

    // pagina doar pt regexuri de mail
    // https://www.regular-expressions.info/email.html
    return /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
        .test(mail)
}

const validationSchema = Yup.object().shape({
    email: Yup.string()
        .required("Email-ul este obligatoriu")
        .test("valid-email", "Email-ul este invalid", check_mail),
    password: Yup.string()
        .min(8, "Parola trebuie sa aiba cel putin 8 caractere")
        .required("Parola este obligatorie"),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Parolele nu se potrivesc")
        .required("Confirmarea parolei este obligatorie"),
});

export function Register() {
    const { registerFn } = useLogin();

    const onSubmit = async (values: { email: string; password: string }) => {
        const response = await registerFn(values.email, values.password)
        if (response !== true)
        {
            alert(response)
        }

        window.location.href = "/login"
    }

    return (
        <div className='signin-section'>
            <div className='signin-overlay'></div>
            <div className='signin-content'>
                <div className='signin-form-wrapper'>
                    <h1 className='signin-title'>Creaza cont</h1>
                    <h2 className='signin-title'>{import.meta.env.KEY}</h2>

                    <Formik
                        initialValues={{
                            email: "",
                            password: "",
                            confirmPassword: "",
                        }}
                        validationSchema={validationSchema}
                        onSubmit={onSubmit}
                    >
                        {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
                            <Form onSubmit={handleSubmit} className='signin-form'>
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

                                <Form.Group className="mb-3">
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

                                <Form.Group className="mb-4">
                                    <Form.Label className='form-label'>Confirma parola</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="confirmPassword"
                                        value={values.confirmPassword}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        isInvalid={touched.confirmPassword && !!errors.confirmPassword}
                                        className='form-input'
                                    />
                                    <Form.Control.Feedback type="invalid" className='error-text'>
                                        {errors.confirmPassword}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Button
                                    type="submit"
                                    className='btn-orange btn-glow w-100'
                                >
                                    Creeaza cont
                                </Button>
                            </Form>
                        )}
                    </Formik>

                    <p className='signin-footer'>
                        Ai deja cont? <a href="/login" className='signin-link'>Conecteaza-te</a>
                    </p>
                </div>
            </div>
        </div>
    )
}