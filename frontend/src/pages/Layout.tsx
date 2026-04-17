import { Outlet } from 'react-router-dom'

import { Container, Nav, Navbar, Button, NavDropdown } from 'react-bootstrap'
import './Layout.css'

export default function Layout() {
    return (
        <>
            <Navbar bg='light' expand='lg' sticky='top' className='navbar-custom'>
                <Container fluid className='px-5'>
                    <Navbar.Brand href="/" className='fw-bolder fs-4 m-0 p-0' style={{color: '#000000', fontWeight: '900'}}>
                        TravelPoints
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto align-items-center gap-3">
                            <Nav.Link href="/" className='text-dark fw-bold'>Home</Nav.Link>
                            <NavDropdown title="Discover" id="discover-dropdown" className='fw-bold'>
                                <NavDropdown.Item href="/destinations/paris">Paris</NavDropdown.Item>
                                <NavDropdown.Item href="/destinations/tokyo">Tokyo</NavDropdown.Item>
                                <NavDropdown.Item href="/destinations/bali">Bali</NavDropdown.Item>
                                <NavDropdown.Item href="/destinations/dubai">Dubai</NavDropdown.Item>
                                <NavDropdown.Item href="/destinations/newyork">New York</NavDropdown.Item>
                            </NavDropdown>
                            <Button 
                                className='btn-slim btn-orange' 
                                href="/signin"
                            >
                                Sign In
                            </Button>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Outlet />
        </>
    )
}