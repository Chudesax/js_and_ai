import {
    formatMoney,
    formatOperationCount,
} from "@/lib/formatters";

import type {
    CurrencyStatistics,
} from "@/types/finance";

interface CurrencyCardProps {
    statistics: CurrencyStatistics;
    rates: Record<string, number>;
    onOpen: (statistics: CurrencyStatistics) => void;
}

/**
 * Интерактивная карточка одной валютной группы.
 */
export function CurrencyCard({
    statistics,
    rates,
    onOpen,
}: CurrencyCardProps) {
    const originalAmount = formatMoney(
        statistics.amount,
        statistics.currency
    );
    const operationLabel = formatOperationCount(
        statistics.operationsCount
    );

    return (
        <button
            type="button"
            onClick={() => onOpen(statistics)}
            aria-label={
                `Открыть успешные операции в ${statistics.currency}`
            }
            className="w-full rounded-3xl border border-pink-100
                bg-pink-50/60 p-5 text-left transition duration-200
                hover:-translate-y-1 hover:border-pink-300
                hover:shadow-lg hover:shadow-pink-100
                focus:outline-none focus:ring-4 focus:ring-pink-200"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="grid h-12 w-12 place-items-center
                    rounded-2xl bg-pink-100 text-sm font-black
                    text-pink-700">
                    {statistics.currency}
                </div>
                <span className="rounded-full bg-white px-3 py-1
                    text-xs font-bold text-pink-600 shadow-sm">
                    {operationLabel}
                </span>
            </div>

            <p className="mt-5 text-3xl font-black tracking-tight
                text-pink-950">
                {originalAmount}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-500">
                Получено в исходной валюте
            </p>

            <ConversionFooter
                statistics={statistics}
                rates={rates}
            />

            <p className="mt-4 text-xs font-bold text-pink-500">
                Нажмите, чтобы посмотреть операции →
            </p>
        </button>
    );
}

interface ConversionFooterProps {
    statistics: CurrencyStatistics;
    rates: Record<string, number>;
}

function ConversionFooter({
    statistics,
    rates,
}: ConversionFooterProps) {
    if (statistics.currency === "USD") {
        const euroRate = rates.EUR;

        if (!Number.isFinite(euroRate) || euroRate <= 0) {
            throw new Error(
                "Не найден актуальный курс EUR для пересчёта USD."
            );
        }

        return (
            <div className="mt-5 border-t border-pink-100 pt-4">
                <div className="flex items-center justify-between
                    gap-4 text-sm">
                    <span className="text-slate-500">
                        В евро, актуальный пересчёт
                    </span>
                    <strong className="text-pink-800">
                        {formatMoney(
                            statistics.amount * euroRate,
                            "EUR"
                        )}
                    </strong>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-5 border-t border-pink-100 pt-4">
            <div className="flex items-center justify-between
                gap-4 text-sm">
                <span className="text-slate-500">
                    В долларах
                </span>
                <strong className="text-pink-800">
                    {formatMoney(statistics.amountInUsd, "USD")}
                </strong>
            </div>
        </div>
    );
}
