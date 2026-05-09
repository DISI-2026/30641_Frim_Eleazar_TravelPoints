import { wishlistAPI, returnResponseWithDefaultError, type ResponseType } from "./base_api";


export type WishlistType = {
    id: string
}

export async function getWishlists(): Promise<ResponseType<WishlistType[]>> {
    try {
        const response = await wishlistAPI.get<ResponseType<WishlistType[]>>("");
        return returnResponseWithDefaultError(response.data, "Problema la verificarea wishlist-ului")
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Problema la verificarea wishlist-ului";
        return { success: false, error: errorMessage };
    }
}

export async function removeWishlist(attractionId: string): Promise<ResponseType> {
    try {
        const response = await wishlistAPI.delete<ResponseType>(`/${attractionId}`);
        return returnResponseWithDefaultError(response.data, "Problema la scoaterea wishlist-ului")
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Problema la scoaterea wishlist-ului";
        return { success: false, error: errorMessage };
    }
}

export async function addWishlist(attractionId: string): Promise<ResponseType> {
    try {
        const response = await wishlistAPI.post<ResponseType>(`/${attractionId}`);
        return returnResponseWithDefaultError(response.data, "Problema la adaugarea wishlist-ului")
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Problema la adaugarea wishlist-ului";
        return { success: false, error: errorMessage };
    }
}