import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from "axios"
import { Cookies } from "react-cookie"

const cookies = new Cookies();

const TOKEN_NAME = 'authorization'

const location = window.location.host
const auth_endpoint = location + (import.meta.env.VITE_DEVICE_URI || "/api")

export const authAPI = axios.create({ baseURL: auth_endpoint })

export function saveAuthToken(token: string) {
    cookies.set(TOKEN_NAME, token, { path: '/', maxAge: 60 * 30 });
}

export function removeAuthToken() {
    cookies.remove(TOKEN_NAME, { path: '/' });
}

export function loadAuthToken(): string | undefined {
    return cookies.get(TOKEN_NAME) as string | undefined;
}


function requestInterceptor(request: InternalAxiosRequestConfig) {
    const token = loadAuthToken();
    if (token) {
        request.headers[TOKEN_NAME] = `Bearer ${token}`
    }
    return request
}

function responseInterceptor(response: AxiosResponse) {
    if (response.headers[TOKEN_NAME]) {
        const token = response.headers[TOKEN_NAME].replace("Bearer ", "")
        saveAuthToken(token)
    }
    return response
}

authAPI.interceptors.request.use(requestInterceptor)
authAPI.interceptors.response.use(responseInterceptor)
