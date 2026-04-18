import { authAPI, removeAuthToken, type ResponseType } from "./base_api";

export type RegisterLoginRequestType = {
    email: string,
    password: string
}

type TokenResponseType = ResponseType

export async function registerUser(data: RegisterLoginRequestType): Promise<TokenResponseType> {
    try {
        const response = await authAPI.post<TokenResponseType>("/register", null, { data: data });
        return response.data;
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred during registration";
        return { success: false, error: errorMessage };
    }
}

export async function loginUser(data: RegisterLoginRequestType): Promise<TokenResponseType> {
    try {
        const response = await authAPI.post<TokenResponseType>("/login", null, { data: data });
        return response.data;
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred during login";
        return { success: false, error: errorMessage };
    }
}

export async function logoutUser() {
    removeAuthToken()
}
