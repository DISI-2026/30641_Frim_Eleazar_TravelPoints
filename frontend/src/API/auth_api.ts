import { authAPI, removeAuthToken, returnResponseWithDefaultError, type ResponseType } from "./base_api";

export type RegisterLoginRequestType = {
    email: string,
    password: string
}

type TokenResponseType = ResponseType

export async function registerUser(data: RegisterLoginRequestType): Promise<TokenResponseType> {
    try {
        const response = await authAPI.post<TokenResponseType>("/register", data);
        return returnResponseWithDefaultError(response.data, "Problema la integistrare")
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Problema la integistrare";
        return { success: false, error: errorMessage };
    }
}

export async function loginUser(data: RegisterLoginRequestType): Promise<TokenResponseType> {
    try {
        const response = await authAPI.post<TokenResponseType>("/login", data);
        return returnResponseWithDefaultError(response.data, "Problema la autentificare")
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Problema la autentificare";
        return { success: false, error: errorMessage };
    }
}

export async function logoutUser() {
    removeAuthToken()
}

export async function forgotPassword(email: string): Promise<ResponseType> {
    try {
        const response = await authAPI.post<ResponseType>(`/forgot-password?email=${email}`);
        return returnResponseWithDefaultError(response.data, "Eroare la trimiterea emailului");
    } catch (err) {
        return { success: false, error: "Eroare la trimiterea emailului" };
    }
}

export async function resetPassword(token: string, newPassword: string): Promise<ResponseType> {
    try {
        const response = await authAPI.post<ResponseType>(`/reset-password?token=${token}&newPassword=${newPassword}`);
        return returnResponseWithDefaultError(response.data, "Eroare la resetarea parolei");
    } catch (err) {
        return { success: false, error: "Eroare la resetarea parolei" };
    }
}
