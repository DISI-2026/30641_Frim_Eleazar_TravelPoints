import Button from "react-bootstrap/esm/Button";

export function Landing() {
    return (
        <div className='hero-section'>
            <div className='hero-overlay'></div>
            <div className='hero-content'>
                <h1 className='hero-title'>
                    Descoperă<br />
                    Următoarea <span className='text-orange'>Mare</span><br />
                    <span className='text-orange'>Aventură</span>
                </h1>
                <p className='hero-description'>
                    Explorează cele mai frumoase destinații, planifică-ți itinerariul și creează amintiri pentru toată viața.
                </p>
                <Button className='btn-orange btn-glow'>
                    Start Exploring
                </Button>
            </div>
        </div>)
}
