import { authAPI, removeAuthToken, returnResponseWithDefaultError as responseWithDefaultError, type ResponseType } from "./base_api";

export type RegisterLoginRequestType = {
    email: string,
    password: string
}

type TokenResponseType = ResponseType

export async function registerUser(data: RegisterLoginRequestType): Promise<TokenResponseType> {
    try {
        const response = await authAPI.post<TokenResponseType>("/register", data);
        return responseWithDefaultError(response.data, "Problema la integistrare")
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Problema la integistrare";
        return { success: false, error: errorMessage };
    }
}

export async function loginUser(data: RegisterLoginRequestType): Promise<TokenResponseType> {
    try {
        const response = await authAPI.post<TokenResponseType>("/login", data);
        return responseWithDefaultError(response.data, "Problema la autentificare")
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Problema la autentificare";
        return { success: false, error: errorMessage };
    }
}

export async function logoutUser() {
    removeAuthToken()
}
