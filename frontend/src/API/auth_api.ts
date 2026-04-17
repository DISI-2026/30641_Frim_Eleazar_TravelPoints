import { authAPI, type ResponseType } from "./base_api";

export type RegisterRequestType = {
    email: string,
    password: string
}

type TokenResponseType = ResponseType

export async function registerUser(data: RegisterRequestType): Promise<TokenResponseType> {
    try {
        const response = await authAPI.post<TokenResponseType>("/register", null, { params: data });
        return response.data;
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred during registration";
        return { success: false, error: errorMessage };
    }
}
