import {
    getFinanceSource1,
    getFinanceSource2,
} from "./api.js";

import { dailySalaryCalc } from "./salary.js";
import {
    renderDashboard,
    renderError,
    renderLoading,
} from "./ui.js";

import "./style.css";

async function main() {
    renderLoading();

    try {
        // Оба источника загружаются одновременно.
        const [
            finance1Response,
            finance2Response,
        ] = await Promise.all([
            getFinanceSource1(),
            getFinanceSource2(),
        ]);

        // Поддерживаем как прямой ответ сервера,
        // так и ответ, обёрнутый в свойство data.
        const source1 =
            finance1Response?.data ??
            finance1Response;

        const source2 =
            finance2Response?.data ??
            finance2Response;

        // dailySalaryCalc теперь асинхронная,
        // поэтому обязательно используем await.
        const salaryResult = await dailySalaryCalc(
            source1,
            source2
        );

        renderDashboard(
            salaryResult,
            new Date()
        );
    } catch (error) {
        console.error(
            `${error.name}: ${error.message}`
        );

        renderError(error);
    }
}

main();
