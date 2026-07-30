/**
 * Форматирует денежную сумму по российским правилам.
 */
export function formatMoney(
    total: number,
    currency: string
): string {
    if (!Number.isFinite(total)) {
        throw new TypeError(
            "Результат расчёта должен быть конечным числом."
        );
    }

    return new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
    }).format(total);
}

/**
 * Форматирует дату формирования отчёта.
 */
export function formatDate(date: Date): string {
    if (Number.isNaN(date.getTime())) {
        throw new TypeError("Некорректная дата расчёта.");
    }

    return new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

/**
 * Ограничивает отображение курса шестью знаками.
 */
export function formatRate(rate: number): string {
    if (!Number.isFinite(rate) || rate <= 0) {
        throw new TypeError(
            "Курс валюты должен быть положительным числом."
        );
    }

    return new Intl.NumberFormat("ru-RU", {
        maximumFractionDigits: 6,
    }).format(rate);
}

/**
 * Выбирает правильную форму русского слова "операция".
 */
export function formatOperationCount(count: number): string {
    const lastTwoDigits = count % 100;
    const lastDigit = count % 10;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return `${count} операций`;
    }

    if (lastDigit === 1) {
        return `${count} операция`;
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
        return `${count} операции`;
    }

    return `${count} операций`;
}

/**
 * Безопасно получает текст из неизвестной ошибки.
 */
export function getErrorMessage(error: unknown): string {
    return error instanceof Error
        ? error.message
        : "Произошла неизвестная ошибка.";
}
