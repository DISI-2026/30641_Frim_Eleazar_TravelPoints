import { authAPI, type ResponseType } from "./base_api";

const JWT_HEADER_NAME = "authorization"

export type RegisterRequestType = {
    username: string,
    password: string
}

type TokenResponseType = ResponseType<"token">

export async function registerUser(data: RegisterRequestType): Promise<TokenResponseType> {
    try {
        const response = await authAPI.post("/register", null, { params: data });
        const JWT = response.headers[JWT_HEADER_NAME] as string | undefined;

        if (!JWT) {
            return { success: false, error: "Tokenul de autentificare nu a fost primit" }
        }
        
        return { success: true, token: JWT };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred during registration";
        return { success: false, error: errorMessage };
    }
}
