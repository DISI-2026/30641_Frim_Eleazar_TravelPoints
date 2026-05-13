import { useEffect, useState } from "react";
import { loadAuthToken, notifications_endpoint } from "../API/base_api";
import { useSSE } from "../hooks/useSSE";
import { NavDropdown } from "react-bootstrap";

type Notification = {
    message: string;
    id_atractie: number;
}

/* Exemplu

data: {"id_atractie": {{int 1 100}}, "message": "{{faker 'lorem.sentence'}}"}


*/

function Notifications() {
    // EventSource nu suporta header-e custom, asa ca atasam JWT-ul ca query param.
    // Backendul foloseste tokenul pentru a identifica utilizatorul si a filtra notificarile
    // doar catre cei care au atractia in wishlist.
    const token = loadAuthToken();
    const sseUrl = token
        ? `${notifications_endpoint}?token=${encodeURIComponent(token)}`
        : notifications_endpoint;

    const { data, error } = useSSE<Notification>(sseUrl)
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        if (data) {
            const newNotification: Notification = data

            // eslint-disable-next-line react-hooks/set-state-in-effect
            setNotifications([newNotification, ...notifications]);

            if (Notification.permission === 'granted') {
                new Notification('TravelPoints', {
                    body: newNotification.message,
                    icon: '/notification-icon.png',
                });
            }
        }
    }, [data]);

    const requestNotificationPermission = async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            console.log('Notification permission:', permission);
        }
    };

    useEffect(() => {
        requestNotificationPermission();
    }, []);


    const clearAllNotifications = () => {
        setNotifications([]);
    };

    return (
        <NavDropdown title={
            <>
                Notificari
                {notifications.length > 0 &&
                    <span className="badge bg-danger mx-2">{notifications.length}</span>
                }
            </>
        } id="notificari-dropdown" className='fw-bold'>
            {error &&
                <>
                    <NavDropdown.Item>Error: {error}</NavDropdown.Item>
                    <NavDropdown.Divider />
                </>
            }
            {
                notifications.length === 0 ?
                    <NavDropdown.Item>Nu exista notificari de afisat</NavDropdown.Item>
                    :
                    <>
                        <NavDropdown.Item as="button" onClick={clearAllNotifications} className="btn btn-secondary mb-3">Sterge toate notificarile</NavDropdown.Item>
                        <NavDropdown.Divider />
                        {notifications.map((notification, index) => (
                            <NavDropdown.Item href={`/attraction/${notification.id_atractie}`} key={index}>
                                {notification.message}
                            </NavDropdown.Item>
                        ))}
                    </>
            }
        </NavDropdown>
    )
}

export default Notifications;