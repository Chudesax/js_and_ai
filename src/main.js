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

/**
 * Главная точка входа приложения.
 *
 * Последовательность работы:
 * 1. Показываем пользователю состояние загрузки.
 * 2. Параллельно получаем данные из двух финансовых API.
 * 3. Передаём сырые ответы в salary.js для проверки и расчёта.
 * 4. Передаём готовый результат в ui.js для отображения.
 *
 * Здесь намеренно нет формул, HTML-шаблонов и настроек API:
 * main.js только связывает специализированные модули между собой.
 *
 * @returns {Promise<void>}
 */
async function main() {
    // Загрузка появляется до первого await, поэтому пользователь
    // сразу видит, что приложение начало работу.
    renderLoading();

    try {
        /*
         * Источники независимы друг от друга, поэтому запускаем
         * запросы одновременно. Promise.all вернёт результаты,
         * когда успешно завершатся оба запроса.
         *
         * Если хотя бы один запрос завершится ошибкой,
         * управление сразу перейдёт в блок catch.
         */
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

        /*
         * Вся проверка данных, фильтрация paid-операций,
         * загрузка курсов и расчёт выполняются в salary.js.
         * main.js получает уже подготовленный отчёт для UI.
         */
        const salaryResult = await dailySalaryCalc(
            source1,
            source2
        );

        // Дату создаём после завершения расчёта, чтобы интерфейс
        // показывал время формирования готового отчёта.
        renderDashboard(
            salaryResult,
            new Date()
        );
    } catch (error) {
        // Ошибку сохраняем в консоли для разработчика...
        console.error(
            `${error.name}: ${error.message}`
        );

        // ...и одновременно показываем понятный экран пользователю.
        renderError(error);
    }
}

// Запускаем приложение после загрузки ES-модуля браузером.
main();
