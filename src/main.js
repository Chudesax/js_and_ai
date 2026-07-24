import {
    getFinanceSource1,
    getFinanceSource2,
} from "./api.js";

import { dailySalaryCalc } from "./salary.js";

async function main() {
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

        console.log("Источник №1:", source1);
        console.log("Источник №2:", source2);

        // dailySalaryCalc теперь асинхронная,
        // поэтому обязательно используем await.
        const result = await dailySalaryCalc(
            source1,
            source2
        );

        console.log(
            "Общая выручка в USD:",
            result
        );

        renderResult(result);
    } catch (error) {
        console.error(
            `${error.name}: ${error.message}`
        );

        renderError(error);
    }
}

/**
 * Показывает итог на странице.
 */
function renderResult(result) {
    const appElement =
        document.querySelector("#app");

    if (!appElement) {
        return;
    }

    appElement.innerHTML = `
        <h1>Дневная выручка</h1>

        <p>
            Общая сумма:
            <strong>
                ${result.total.toFixed(2)}
                ${result.currency}
            </strong>
        </p>
    `;
}

/**
 * Показывает ошибку на странице.
 */
function renderError(error) {
    const appElement =
        document.querySelector("#app");

    if (!appElement) {
        return;
    }

    appElement.innerHTML = `
        <h1>Ошибка</h1>
        <p>${error.message}</p>
    `;
}

main();