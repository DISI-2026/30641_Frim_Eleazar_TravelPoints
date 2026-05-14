import { Outlet } from 'react-router-dom'

import { Container, Nav, Navbar, Button } from 'react-bootstrap'
import './Layout.css'
import { useLogin } from '../context/AuthContext'
import Notifications from '../components/Notifications'

export default function Layout() {
    const { isLoggedIn, role, logoutFn } = useLogin()
    const isAdmin = role === 'ROLE_ADMIN'
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
                            <Nav.Link href="/attractions" className='text-dark fw-bold'>Atracții</Nav.Link>
                            {isLoggedIn && (
                                <Nav.Link href="/wishlist" className='text-dark fw-bold'>Wishlist</Nav.Link>
                            )}
                            {isAdmin && (
                                <Nav.Link href="/newattraction" className='text-dark fw-bold'>Atracție Noua</Nav.Link>
                            )}
                            {isLoggedIn && <Notifications />}

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
