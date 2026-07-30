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
