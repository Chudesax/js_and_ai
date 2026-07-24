import { request } from "./api.js";

import {
    CURRENCY_API_BASE_URL,
    CURRENCY_API_KEY,
} from "./config.js";

/**
 * Получает актуальные курсы валют относительно USD.
 *
 * Например:
 *
 * getUsdRates(["EUR", "GBP"])
 *
 * может вернуть:
 *
 * {
 *     EUR: 0.92,
 *     GBP: 0.78,
 *     USD: 1
 * }
 *
 * @param {string[]} currencies
 * @returns {Promise<Record<string, number>>}
 */
export async function getUsdRates(currencies) {
    if (!Array.isArray(currencies)) {
        throw new TypeError(
            "Список валют должен быть массивом."
        );
    }

    // Нормализуем валюты:
    // "usd", " USD " и "Usd" превращаются в "USD".
    const normalizedCurrencies = currencies.map(
        normalizeCurrency
    );

    // Удаляем повторяющиеся значения.
    const uniqueCurrencies = [
        ...new Set(normalizedCurrencies),
    ];

    // USD не нужно запрашивать у сервера:
    // курс USD относительно самого себя всегда равен 1.
    const currenciesForRequest = uniqueCurrencies.filter(
        currency => currency !== "USD"
    );

    // Если все операции уже находятся в USD,
    // запрос к CurrencyFreaks не требуется.
    if (currenciesForRequest.length === 0) {
        return {
            USD: 1,
        };
    }

    const searchParams = new URLSearchParams({
        apikey: CURRENCY_API_KEY,
        base: "USD",
        symbols: currenciesForRequest.join(","),
    });

    const url =
        `${CURRENCY_API_BASE_URL}/rates/latest?` +
        searchParams.toString();

    const response = await request(url);

    if (
        response === null ||
        typeof response !== "object" ||
        typeof response.rates !== "object" ||
        response.rates === null
    ) {
        throw new Error(
            "CurrencyFreaks вернул некорректный ответ."
        );
    }

    const rates = {
        USD: 1,
    };

    for (const currency of currenciesForRequest) {
        const rawRate =
            response.rates[currency] ??
            response.rates[currency.toLowerCase()];

        const rate = Number(rawRate);

        if (!Number.isFinite(rate) || rate <= 0) {
            throw new Error(
                `CurrencyFreaks не вернул корректный курс для ${currency}.`
            );
        }

        rates[currency] = rate;
    }

    return rates;
}

/**
 * Приводит код валюты к единому виду.
 *
 * @param {*} currency
 * @returns {string}
 */
function normalizeCurrency(currency) {
    if (
        typeof currency !== "string" ||
        currency.trim() === ""
    ) {
        throw new TypeError(
            "Валюта должна быть непустой строкой."
        );
    }

    return currency.trim().toUpperCase();
}