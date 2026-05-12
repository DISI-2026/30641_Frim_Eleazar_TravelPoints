import { analyticsAPI, type ResponseType } from "./base_api";

export type HourlyStat = {
    hour: string;
    visits: number;
}

export type MonthlyStat = {
    month: string;
    visits: number;
}

export type AttractionPopularity = {
    attractionId: string;
    name: string;
    views: number;
}

export function getAnalyticsTime
    (
        attraction_id: string,
        granularity: 'hour'
    ): Promise<ResponseType<HourlyStat[]>>;

export function getAnalyticsTime
    (
        attraction_id: string,
        granularity: 'month'
    ): Promise<ResponseType<MonthlyStat[]>>;

export function getAnalyticsTime
    (
        attraction_id: string,
        granularity: 'hour' | 'month'
    ): Promise<ResponseType<HourlyStat[] | MonthlyStat[]>>;

export async function getAnalyticsTime(attraction_id: string, granularity: 'hour' | 'month' = 'hour')
    : Promise<ResponseType<HourlyStat[] | MonthlyStat[]>> {

    try {
        if (granularity === 'hour') {
            return analyticsAPI.get<ResponseType<HourlyStat[]>>(`/${attraction_id}/time`, {
                params: { granularity }
            }).then(response => response.data);
        }

        return analyticsAPI.get<ResponseType<MonthlyStat[]>>(`/${attraction_id}/time`, {
            params: { granularity }
        }).then(response => response.data);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Problema la culegerea analiticilor";
        return { success: false, error: errorMessage };
    }
}

export async function getAnalyticsPopularity(): Promise<ResponseType<AttractionPopularity[]>> {
    return analyticsAPI.get<ResponseType<AttractionPopularity[]>>(`/popular`)
        .then(response => response.data);
}