/**
 * Одна успешная операция внутри валютной группы.
 */
export interface SuccessfulOperation {
    amount: number;
    amountInUsd: number;
    source: string;
}

/**
 * Сводные данные по одной исходной валюте.
 */
export interface CurrencyStatistics {
    currency: string;
    amount: number;
    operationsCount: number;
    amountInUsd: number;
    usdRate: number;
    operations: SuccessfulOperation[];
}

/**
 * Результат бизнес-расчёта, который получает интерфейс.
 */
export interface DashboardReport {
    total: number;
    currency: "USD";
    statistics: CurrencyStatistics[];
    rates: Record<string, number>;
}

/**
 * Данные страницы включают отчёт и момент его формирования.
 */
export interface DashboardData {
    report: DashboardReport;
    calculatedAt: Date;
}

/**
 * Снимок курса, использованного в завершённом расчёте.
 *
 * История пока хранится локально в браузере. После появления
 * backend этот интерфейс можно сохранить, заменив только
 * источник данных.
 */
export interface RateSnapshot {
    calculatedAt: string;
    baseCurrency: "USD";
    targetCurrency: "EUR";
    rate: number;
}
