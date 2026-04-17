import { Outlet } from 'react-router-dom'

import { Container, Nav, Navbar, Button, NavDropdown } from 'react-bootstrap'
import './Layout.css'
import { useLogin } from '../context/AuthContext'

export default function Layout() {
    const { isLoggedIn, logoutFn } = useLogin()
    return (
        <>
            <Navbar bg='light' expand='lg' sticky='top' className='navbar-custom'>
                <Container fluid className='px-5'>
                    <Navbar.Brand href="/" className='fw-bolder fs-4 m-0 p-0' style={{ color: '#000000', fontWeight: '900' }}>
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

                            {
                                isLoggedIn ?
                                    <Button className='btn-slim btn-orange'
                                        onClick={logoutFn}>
                                        Deconectare
                                    </Button>
                                    :
                                    <Button
                                        className='btn-slim btn-orange'
                                        href="/login">
                                        Log in
                                    </Button>
                            }

                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Outlet />
        </>
    )
}