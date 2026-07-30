import {
    useEffect,
    useState,
} from "react";
import { useQuery } from "@tanstack/react-query";

import { getDashboardData } from "../api/dashboard";
import { CurrencyCard } from "../components/CurrencyCard";
import { OperationsModal } from "../components/OperationsModal";
import { RatesPanel } from "../components/RatesPanel";
import { ErrorScreen } from "../components/ui/ErrorScreen";
import { LoadingScreen } from "../components/ui/LoadingScreen";
import {
    formatDate,
    formatMoney,
} from "../lib/formatters";
import {
    getRateHistory,
    saveRateSnapshot,
} from "../lib/rateHistory";

import type {
    CurrencyStatistics,
    RateSnapshot,
} from "../types/finance";

/**
 * Главная страница финансового отчёта.
 */
export default function DashboardPage() {
    const [selectedStatistics, setSelectedStatistics] =
        useState<CurrencyStatistics | null>(null);
    const [rateHistory, setRateHistory] =
        useState<RateSnapshot[]>(getRateHistory);

    const dashboardQuery = useQuery({
        queryKey: ["dashboard-report"],
        queryFn: getDashboardData,
    });

    /*
     * Историю обновляем только после успешного расчёта.
     * Ошибочный или незавершённый запрос не создаёт запись.
     */
    useEffect(() => {
        if (!dashboardQuery.data) {
            return;
        }

        const {
            report,
            calculatedAt,
        } = dashboardQuery.data;

        setRateHistory(
            saveRateSnapshot(
                calculatedAt,
                report.rates.EUR
            )
        );
    }, [dashboardQuery.data]);

    if (dashboardQuery.isPending) {
        return <LoadingScreen />;
    }

    if (dashboardQuery.isError) {
        return (
            <ErrorScreen
                error={dashboardQuery.error}
                onRetry={() => {
                    void dashboardQuery.refetch();
                }}
            />
        );
    }

    const {
        report,
        calculatedAt,
    } = dashboardQuery.data;

    const operationsCount = report.statistics.reduce(
        (total, item) => total + item.operationsCount,
        0
    );

    return (
        <>
            <title>Дашборд | Pink Finance</title>
            <meta
                name="description"
                content="Дневная выручка и статистика продаж"
            />

            <main className="dot-pattern min-h-[calc(100vh-65px)]
                px-4 py-8 sm:px-6 lg:py-12">
                <div className="mx-auto max-w-6xl">
                    <header className="mb-8 flex flex-col gap-5
                        rounded-[2rem] border border-white/80 bg-white/85
                        p-6 shadow-xl shadow-pink-200/50 backdrop-blur
                        sm:flex-row sm:items-center sm:justify-between
                        sm:p-8">
                        <div>
                            <p className="mb-2 text-sm font-bold uppercase
                                tracking-[0.22em] text-pink-500">
                                Daily report
                            </p>
                            <h1 className="text-3xl font-black
                                tracking-tight text-pink-900 sm:text-4xl">
                                Розовая статистика{" "}
                                <span aria-hidden="true">🎀</span>
                            </h1>
                            <p className="mt-3 max-w-xl text-sm leading-6
                                text-slate-500 sm:text-base">
                                Выручка и валютная статистика за один день —
                                аккуратно собраны в одном месте.
                            </p>
                        </div>

                        <div className="shrink-0 rounded-2xl border
                            border-pink-100 bg-pink-50 px-5 py-4
                            text-left sm:text-right">
                            <p className="text-xs font-bold uppercase
                                tracking-wider text-pink-500">
                                Дата расчёта
                            </p>
                            <time
                                className="mt-1 block font-bold
                                    text-pink-950"
                                dateTime={calculatedAt.toISOString()}
                            >
                                {formatDate(calculatedAt)}
                            </time>
                        </div>
                    </header>

                    <section
                        aria-labelledby="revenue-title"
                        className="relative mb-6 overflow-hidden
                            rounded-[2rem] bg-gradient-to-br
                            from-pink-500 via-pink-400 to-rose-300
                            p-7 text-white shadow-xl shadow-pink-300/40
                            sm:p-10"
                    >
                        <div
                            className="absolute -right-10 -top-10 h-40
                                w-40 rounded-full border-[24px]
                                border-white/15"
                            aria-hidden="true"
                        />
                        <p
                            id="revenue-title"
                            className="text-sm font-bold uppercase
                                tracking-[0.2em] text-pink-50"
                        >
                            Общая дневная выручка
                        </p>
                        <p className="mt-3 text-4xl font-black
                            tracking-tight sm:text-6xl">
                            {formatMoney(report.total, report.currency)}
                        </p>
                        <p className="mt-4 max-w-xl text-sm leading-6
                            text-pink-50 sm:text-base">
                            Учтены только оплаченные операции.
                            Все валюты приведены к USD по единому
                            набору курсов.
                        </p>
                    </section>

                    <div className="grid items-start gap-6
                        lg:grid-cols-[1fr_19rem]">
                        <section
                            aria-labelledby="currencies-title"
                            className="rounded-[2rem] border border-white/80
                                bg-white/90 p-6 shadow-xl
                                shadow-pink-200/40 backdrop-blur sm:p-8"
                        >
                            <div className="mb-6 flex flex-col gap-3
                                sm:flex-row sm:items-end
                                sm:justify-between">
                                <div>
                                    <p className="text-sm font-bold
                                        uppercase tracking-[0.2em]
                                        text-pink-500">
                                        Поступления
                                    </p>
                                    <h2
                                        id="currencies-title"
                                        className="mt-2 text-2xl
                                            font-black text-pink-950"
                                    >
                                        Статистика по валютам
                                    </h2>
                                </div>
                                <p className="text-sm font-semibold
                                    text-slate-500">
                                    Учтено операций:{" "}
                                    <strong className="text-pink-700">
                                        {operationsCount}
                                    </strong>
                                </p>
                            </div>

                            {report.statistics.length === 0 ? (
                                <p className="rounded-3xl border
                                    border-dashed border-pink-200
                                    bg-pink-50 p-6 text-center text-sm
                                    font-semibold text-slate-500">
                                    За выбранный день оплаченных
                                    поступлений нет.
                                </p>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2">
                                    {report.statistics.map(statistics => (
                                        <CurrencyCard
                                            key={statistics.currency}
                                            statistics={statistics}
                                            rates={report.rates}
                                            onOpen={setSelectedStatistics}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>

                        <RatesPanel
                            rates={report.rates}
                            history={rateHistory}
                        />
                    </div>

                    <footer className="py-6 text-center text-xs
                        font-semibold text-pink-400">
                        Made with care, React &amp; a little pink magic
                    </footer>
                </div>
            </main>

            <OperationsModal
                statistics={selectedStatistics}
                onClose={() => setSelectedStatistics(null)}
            />
        </>
    );
}
