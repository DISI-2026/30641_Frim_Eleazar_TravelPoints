import { Form, Button } from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import './NewAttraction.css';
import { createAttraction, type AttractionType } from "../API/attraction_api";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_FORMATS = ['audio/mpeg', 'audio/wav', 'audio/x-wav', "audio/vnd.wave"];

const validationSchema = Yup.object().shape({
    name: Yup.string()
        .required("Va rugam introduceti numele atracției"),
    description: Yup.string()
        .required("Va rugam introduceti descrierea"),
    location: Yup.string()
        .required("Va rugam introduceti locația"),
    audioFile: Yup.mixed<File>()
        .required("Va rugam selectati un fisier audio")
        .test('fileSize', 'Fișierul este prea mare (Max 2MB)', (value) => {
            if (value instanceof File) {
                return value.size <= MAX_FILE_SIZE;
            }
            return false;
        })
        .test('fileType', 'Fișierul trebuie sa fie audio', (value) => {
            console.log(value)
            if (value instanceof File) {
                return SUPPORTED_FORMATS.includes(value.type);
            }
            return false;
        })
});

export function AttractionForm({ isEditing, initialValues = {
    name: "",
    description: "",
    location: "",
    audioFile: null,
}, onSubmitFunc }: { isEditing?: boolean, initialValues?: AttractionType, onSubmitFunc: (values: AttractionType) => (Promise<void> | void) }) {
    return (
        <div className="new-attraction-form-wrapper">
            <h1 className="new-attraction-title">{isEditing ? "Editează atracția" : "Creează o nouă atracție"}</h1>
            < Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmitFunc}
            >
                {({ values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue }) => (
                    <Form onSubmit={handleSubmit} className="new-attraction-form">
                        <Form.Group className="mb-3">
                            <Form.Label className="form-label">Nume</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                placeholder="Numele atracției"
                                value={values.name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                isInvalid={touched.name && !!errors.name}
                                className="form-input"
                            />
                            <Form.Control.Feedback type="invalid" className="error-text">
                                {errors.name}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="form-label">Descriere</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                name="description"
                                placeholder="Descrierea atracției"
                                value={values.description}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                isInvalid={touched.description && !!errors.description}
                                className="form-input"
                            />
                            <Form.Control.Feedback type="invalid" className="error-text">
                                {errors.description}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="form-label">Locație</Form.Label>
                            <Form.Control
                                type="text"
                                name="location"
                                placeholder="Locația atracției"
                                value={values.location}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                isInvalid={touched.location && !!errors.location}
                                className="form-input"
                            />
                            <Form.Control.Feedback type="invalid" className="error-text">
                                {errors.location}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="form-label">Fisier Audio</Form.Label>
                            <Form.Control
                                type="file"
                                name="audioFile"
                                accept=".mp3,audio/mpeg,audio/wav,audio/x-wav"
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                    const file = event.currentTarget.files?.[0];
                                    setFieldValue('audioFile', file);
                                }}
                                className="form-input"
                                isInvalid={touched.audioFile && !!errors.audioFile}
                            />
                            <Form.Control.Feedback type="invalid" className="error-text">
                                {errors.audioFile}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Button
                            type="submit"
                            className="btn-orange btn-glow w-100"
                        >
                            {isEditing ? "Salvează modificările" : "Creează Atracția"}
                        </Button>
                    </Form>
                )}
            </Formik >
        </div>)
}

export default function NewAttraction() {
    const navigate = useNavigate();

    const onSubmitHandler = async (values: AttractionType) => {
        console.log("Form Values:", {
            name: values.name,
            description: values.description,
            location: values.location,
            audioFile: values.audioFile,
            fileName: values.audioFile?.name,
            fileType: values.audioFile?.type,
            fileSize: values.audioFile?.size
        });
        const response = await createAttraction(values)
        if (!response.success) {
            alert(response.error)
            // window.location.reload(); 
            return
        }

        navigate('/')
    };

    return (
        <div className="new-attraction-section">
            <div className="new-attraction-overlay"></div>
            <div className="new-attraction-content">
                <AttractionForm onSubmitFunc={onSubmitHandler} />

            </div>
        </div>
    );
}