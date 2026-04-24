import Container from "react-bootstrap/esm/Container"
import Spinner from "react-bootstrap/esm/Spinner"

export default function LoadingPlaceholder() {
    return (<Container>
        <br />
        <br />
        <h1>Se incarca informatiile...</h1>
        <Spinner />
    </Container>)
}
