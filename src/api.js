import {
    FINANCE_API_BASE_URL,
    FINANCE_API_KEY,
} from "./config.js";

/**
 * Универсальная функция HTTP-запросов.
 *
 * Она ничего не знает о конкретном API.
 * Все адреса, заголовки и параметры передаются снаружи.
 *
 * @param {string} url
 * @param {object} options
 * @param {string} options.method
 * @param {object} options.headers
 * @param {*} options.body
 *
 * @returns {Promise<*>}
 */
export async function request(
    url,
    {
        method = "GET",
        headers = {},
        body = null,
    } = {}
) {
    if (typeof url !== "string" || url.trim() === "") {
        throw new TypeError(
            "URL запроса должен быть непустой строкой."
        );
    }

    if (typeof method !== "string") {
        throw new TypeError(
            "HTTP-метод должен быть строкой."
        );
    }

    const normalizedMethod = method.toUpperCase();

    const requestHeaders = {
        Accept: "application/json",
        ...headers,
    };

    const requestOptions = {
        method: normalizedMethod,
        headers: requestHeaders,
    };

    // GET и HEAD обычно не содержат тело запроса.
    if (
        body !== null &&
        normalizedMethod !== "GET" &&
        normalizedMethod !== "HEAD"
    ) {
        if (body instanceof FormData) {
            requestOptions.body = body;
        } else if (
            typeof body === "object" &&
            body !== null
        ) {
            requestHeaders["Content-Type"] =
                "application/json";

            requestOptions.body = JSON.stringify(body);
        } else {
            requestOptions.body = body;
        }
    }

    let response;

    try {
        response = await fetch(url, requestOptions);
    } catch (error) {
        throw new Error(
            `Не удалось выполнить запрос к ${url}: ${error.message}`
        );
    }

    const responseText = await response.text();

    let responseData = null;

    if (responseText !== "") {
        try {
            responseData = JSON.parse(responseText);
        } catch {
            responseData = responseText;
        }
    }

    if (!response.ok) {
        let errorMessage = response.statusText;

        if (
            typeof responseData === "object" &&
            responseData !== null
        ) {
            errorMessage =
                responseData.message ??
                responseData.error ??
                response.statusText;
        } else if (typeof responseData === "string") {
            errorMessage = responseData;
        }

        throw new Error(
            `Ошибка HTTP ${response.status}: ${errorMessage}`
        );
    }

    return responseData;
}

/**
 * Выполняет запрос к финансовому API.
 *
 * Заголовок x-api-key автоматически добавляется
 * ко всем запросам этого API.
 *
 * @param {string} endpoint
 */
function financeRequest(endpoint) {
    const url = `${FINANCE_API_BASE_URL}${endpoint}`;

    return request(url, {
        headers: {
            "x-api-key": FINANCE_API_KEY,
        },
    });
}

/**
 * Получает первый финансовый источник.
 */
export function getFinanceSource1() {
    return financeRequest("/api/finance1");
}

/**
 * Получает второй финансовый источник.
 */
export function getFinanceSource2() {
    return financeRequest("/api/finance2");
}