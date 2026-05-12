import { contactAPI, returnResponseWithDefaultError, type ResponseType } from "./base_api";

export async function sendContactEmail(subject: string, message: string): Promise<ResponseType> {
    try {
        const response = await contactAPI.post<ResponseType>("", { subject, message });
        return returnResponseWithDefaultError(response.data, "Problema la trimiterea mesajului");
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Problema la trimiterea mesajului";
        return { success: false, error: errorMessage };
    }
}