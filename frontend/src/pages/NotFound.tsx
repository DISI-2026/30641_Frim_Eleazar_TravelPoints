import { Button } from 'react-bootstrap'
import './NotFound.css'

export default function NotFound() {
    return (
        <div className='notfound-section'>
            <div className='notfound-overlay'></div>
            <div className='notfound-content'>
                <div className='sad-face'>:-( </div>
                <h1 className='notfound-title'>404</h1>
                <h2 className='notfound-subtitle'>Pagina nu a fost gasita</h2>
                <p className='notfound-description'>
                    Ne pare rau, pagina pe care o cauti nu exista.
                </p>
                <Button 
                    className='btn-orange btn-glow'
                    href="/"
                >
                    Mergi la pagina acasa
                </Button>
            </div>
        </div>
    )
}