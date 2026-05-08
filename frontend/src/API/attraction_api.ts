import { attractionAPI, returnResponseWithDefaultError, type ResponseType } from "./base_api";

export type AttractionType =
    {
        id?: string,
        name: string;
        description: string;
        location: string;
        audioFile: string | null;
    }

export type ReviewType =
    {
        id?: string,
        author: string;
        text: string;
    }

type AttractionCreationResponseType = ResponseType<{ id: number }>
type AttractionListResponseType = ResponseType<AttractionType[]>

export async function createAttraction(data: AttractionType): Promise<AttractionCreationResponseType> {
    try {
        const response = await attractionAPI.post<AttractionCreationResponseType>("/create", data, { headers: { 'Content-Type': 'multipart/form-data' } });
        return returnResponseWithDefaultError(response.data, "Problema la creare")
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Problema la creare";
        return { success: false, error: errorMessage };
    }
}

export async function getAttractions(): Promise<AttractionListResponseType> {
    try {
        const response = await attractionAPI.get<AttractionListResponseType>("");
        return returnResponseWithDefaultError(response.data, "Problema la listare a atractiilor")
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Problema la listare a atractiilor";
        return { success: false, error: errorMessage };
    }
}

export async function deleteAttraction(attraction: AttractionType): Promise<ResponseType> {
    try {
        const response = await attractionAPI.delete<ResponseType>(`${attraction.id}`);
        return returnResponseWithDefaultError(response.data, "Problema la stergerea atractiei")
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Problema la stergerea atractiei";
        return { success: false, error: errorMessage };
    }
}

export async function updateAttraction(attraction: AttractionType): Promise<ResponseType> {
    try {
        const response = await attractionAPI.put<ResponseType>(`${attraction.id}`, attraction, { headers: { 'Content-Type': 'multipart/form-data' } });
        return returnResponseWithDefaultError(response.data, "Problema la actualizarea atractiei")
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Problema la actualizarea atractiei";
        return { success: false, error: errorMessage };
    }
}

export async function getReviews(attraction: AttractionType): Promise<ResponseType<ReviewType[]>> {
    try {
        const response = await attractionAPI.get<ResponseType<ReviewType[]>>(`${attraction.id}/reviews`);
        return returnResponseWithDefaultError(response.data, "Problema la preluarea recenziilor")
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Problema la preluarea recenziilor";
        return { success: false, error: errorMessage };
    }
}

export async function addReview(attraction: AttractionType, text: string): Promise<ResponseType> {
    try {
        const response = await attractionAPI.post<ResponseType>(`${attraction.id}/reviews`, { text: text });
        return returnResponseWithDefaultError(response.data, "Problema la adaugarea recenziei")
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Problema la adaugarea recenziei";
        return { success: false, error: errorMessage };
    }
}