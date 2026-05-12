import { useEffect, useState } from "react";
import { notifications_endpoint } from "../API/base_api";
import { useSSE } from "../hooks/useSSE";
import { NavDropdown } from "react-bootstrap";

type Notification = {
    message: string;
}

/* Exemp[le]

data: {"id": {{int 1 10000}}, "message": "{{faker 'lorem.sentence'}}"}

data: {"id": 1, "message": "Felicitari! Ai castigat o noua oferta! Da-ne cardul tau de credit"}

*/

function Notifications() {
    const { data, error } = useSSE<string>(notifications_endpoint)
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        if (data) {
            console.log(data)

            const newNotification: Notification = { message: data }

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
                        {/* <ul className="list-group"> */}
                        {notifications.map((notification, index) => (
                            <NavDropdown.Item key={index}>
                                {notification.message}
                            </NavDropdown.Item>
                        ))}
                        {/* </ul> */}
                    </>
            }
        </NavDropdown>
    )
}

export default Notifications;