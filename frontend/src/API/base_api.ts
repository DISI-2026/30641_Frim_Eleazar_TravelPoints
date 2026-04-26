import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from "axios"
import { Cookies } from "react-cookie"

const cookies = new Cookies();

const TOKEN_NAME = 'authorization'

const location = import.meta.env.VITE_API_ENTRYPOINT || window.location.host
const auth_endpoint = location + (import.meta.env.VITE_AUTH_API || "/auth")
const attraction_endpoint = location + (import.meta.env.VITE_ATTRACTION_API || "/attraction")

export const authAPI = axios.create({ baseURL: auth_endpoint })
export const attractionAPI = axios.create({ baseURL: attraction_endpoint })

export type ResponseType<D extends object | undefined = undefined> = 
    | (D extends undefined 
        ? { success: true }
        : { success: true } & D)
    | { success: false; error: string }

export function saveAuthToken(token: string) {
    cookies.set(TOKEN_NAME, token, { path: '/', maxAge: 60 * 30 });
}

export function removeAuthToken() {
    cookies.remove(TOKEN_NAME, { path: '/' });
}

export function loadAuthToken(): string | undefined {
    return cookies.get(TOKEN_NAME) as string | undefined;
}

export function returnResponseWithDefaultError<D extends object>(res: ResponseType<D>, defaultErrorMessage: string): ResponseType<D> {
    if (res.success) {
        return res
    }

    if (res.error === undefined) {
        return {...res, error:defaultErrorMessage}
    }

    return res
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
attractionAPI.interceptors.request.use(requestInterceptor)

authAPI.interceptors.response.use(responseInterceptor)
