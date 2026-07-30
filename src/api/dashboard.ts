import {
    getFinanceSource1,
    getFinanceSource2,
} from "../api.js";
import { dailySalaryCalc } from "../salary.js";

import type {
    DashboardData,
    DashboardReport,
} from "../types/finance";

/**
 * Загружает оба источника и формирует готовые данные дашборда.
 *
 * Пока эта функция использует существующие JavaScript-модули.
 * Благодаря такому адаптеру React ничего не знает о формате
 * внешних API, а бизнес-логику не нужно переписывать сразу.
 */
export async function getDashboardData(): Promise<DashboardData> {
    const [
        finance1Response,
        finance2Response,
    ] = await Promise.all([
        getFinanceSource1(),
        getFinanceSource2(),
    ]);

    // Сервер может вернуть данные напрямую или внутри поля data.
    const source1 =
        finance1Response?.data ?? finance1Response;
    const source2 =
        finance2Response?.data ?? finance2Response;

    const report = await dailySalaryCalc(
        source1,
        source2
    ) as DashboardReport;

    return {
        report,
        calculatedAt: new Date(),
    };
}
