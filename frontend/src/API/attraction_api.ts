import { attractionAPI, returnResponseWithDefaultError, type ResponseType } from "./base_api";

export type AttractionType =
    {
        id?: number,
        name: string;
        description: string;
        location: string;
        audioFile: File | null;
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
        const response = await attractionAPI.delete<ResponseType>("", {params: {id: attraction.id}});
        return returnResponseWithDefaultError(response.data, "Problema la stergerea atractiei")
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Problema la stergerea atractiei";
        return { success: false, error: errorMessage };
    }
}