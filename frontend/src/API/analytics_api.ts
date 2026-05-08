import { analyticsAPI, type ResponseType } from "./base_api";

export type HourlyStat = {
    hour: string;
    visits: number;
}

export type MonthlyStat = {
    month: string;
    visits: number;
}

export function getAnalyticsTime
    (
        attraction_id: number,
        granularity: 'hour'
    ): Promise<ResponseType<HourlyStat[]>>;

export function getAnalyticsTime
    (
        attraction_id: number,
        granularity: 'month'
    ): Promise<ResponseType<MonthlyStat[]>>;

export function getAnalyticsTime
    (
        attraction_id: number,
        granularity: 'hour' | 'month'
    ): Promise<ResponseType<HourlyStat[] | MonthlyStat[]>>;

export async function getAnalyticsTime(attraction_id: number, granularity: 'hour' | 'month' = 'hour')
    : Promise<ResponseType<HourlyStat[] | MonthlyStat[]>> {

    try {
        if (granularity === 'hour') {
            return analyticsAPI.get<ResponseType<HourlyStat[]>>("/time", {
                params: { granularity, attraction_id }
            }).then(response => response.data);
        }

        return analyticsAPI.get<ResponseType<MonthlyStat[]>>("/time", {
            params: { granularity, attraction_id }
        }).then(response => response.data);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Problema la culegerea analiticilor";
        return { success: false, error: errorMessage };
    }
}
