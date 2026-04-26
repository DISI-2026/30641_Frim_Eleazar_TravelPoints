import { attractionAPI, returnResponseWithDefaultError, type ResponseType } from "./base_api";

export type AttractionType =
    {
        name: string;
        description: string;
        location: string;
        audioFile: File | null;
    }

type AttractionCreationResponseType = ResponseType<{ id: number }>

export async function createAttraction(data: AttractionType): Promise<AttractionCreationResponseType> {
    try {
        const response = await attractionAPI.post<AttractionCreationResponseType>("/create", data, { headers: { 'Content-Type': 'multipart/form-data' } });
        return returnResponseWithDefaultError(response.data, "Problema la creare")
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Problema la creare";
        return { success: false, error: errorMessage };
    }
}