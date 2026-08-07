import { useState } from "react";

import {
    validateIncomeSources,
} from "@/lib/incomeValidation";
import type {
    IncomeValidationReport,
} from "@/lib/incomeValidation";

const sourceDescriptions = [
    {
        name: "Источник №1",
        endpoint: "/api/finance1",
        format: "JSON-объекты с типом, суммой и валютой",
    },
    {
        name: "Источник №2",
        endpoint: "/api/finance2",
        format: "Массив строк в формате «300 USD»",
    },
];

function formatCheckedAt(date: Date) {
    return new Intl.DateTimeFormat("ru-RU", {
        dateStyle: "long",
        timeStyle: "medium",
    }).format(date);
}

export default function SourcesPage() {
    const [report, setReport] = useState<IncomeValidationReport | null>(null);
    const [isChecking, setIsChecking] = useState(false);

    async function handleCheck() {
        setIsChecking(true);

        try {
            setReport(await validateIncomeSources());
        } finally {
            setIsChecking(false);
        }
    }

    const totalReceived = report?.sources.reduce(
        (total, source) => total + source.itemCount,
        0,
    ) ?? 0;
    const totalAccepted = report?.sources.reduce(
        (total, source) => total + source.acceptedCount,
        0,
    ) ?? 0;

    return (
        <>
            <title>Источник | Pink Finance</title>
            <main className="mx-auto max-w-6xl p-5 sm:p-6 lg:py-12">
                <header className="flex flex-col gap-5 rounded-[2rem] bg-white
                    p-7 shadow-xl shadow-pink-200/40 sm:flex-row
                    sm:items-end sm:justify-between sm:p-9">
                    <div>
                        <h1 className="text-3xl font-black text-pink-950">
                            Источник
                        </h1>
                        <p className="mt-3 max-w-2xl text-slate-500">
                            Текущие финансовые API и быстрая проверка качества
                            данных до расчёта.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="min-h-12 shrink-0 rounded-full bg-pink-600
                            px-6 py-3 text-sm font-black text-white shadow-lg
                            shadow-pink-300/40 transition hover:bg-pink-700
                            focus-visible:outline-2 focus-visible:outline-offset-2
                            focus-visible:outline-pink-600 disabled:cursor-wait
                            disabled:opacity-60"
                        onClick={handleCheck}
                        disabled={isChecking}
                    >
                        {isChecking ? "Проверяем…" : "Проверить данные"}
                    </button>
                </header>

                <section
                    className="mt-6 grid gap-4 md:grid-cols-2"
                    aria-label="Источники данных"
                >
                    {sourceDescriptions.map((source, index) => {
                        const result = report?.sources[index];

                        return (
                            <article
                                key={source.endpoint}
                                className="rounded-[1.75rem] border border-pink-100
                                    bg-white p-6"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-black text-pink-950">
                                            {source.name}
                                        </h2>
                                        <code className="mt-1 block text-sm text-pink-600">
                                            {source.endpoint}
                                        </code>
                                    </div>
                                    {result ? (
                                        <span className={`rounded-full px-3 py-1 text-xs
                                            font-black ${result.isAvailable
                                                ? "bg-emerald-50 text-emerald-700"
                                                : "bg-rose-50 text-rose-700"}`}
                                        >
                                            {result.isAvailable ? "Доступен" : "Ошибка"}
                                        </span>
                                    ) : null}
                                </div>
                                <p className="mt-5 text-sm leading-6 text-slate-500">
                                    {source.format}
                                </p>
                                {result ? (
                                    <div className="mt-5 border-t border-pink-50 pt-4">
                                        <p className="font-bold text-slate-700">
                                            Получено {result.itemCount} · принято {result.acceptedCount}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {result.summary}
                                        </p>
                                        {result.exclusionReason ? (
                                            <p className="mt-2 text-sm font-bold text-amber-700">
                                                {result.exclusionReason}
                                            </p>
                                        ) : null}
                                    </div>
                                ) : null}
                            </article>
                        );
                    })}
                </section>

                <section
                    className="mt-6 rounded-[2rem] bg-pink-950 p-7 text-white
                        shadow-xl shadow-pink-300/30 sm:p-9"
                    aria-live="polite"
                    aria-busy={isChecking}
                >
                    {report ? (
                        <div className="max-w-3xl">
                            <p className="text-sm font-bold text-pink-200">
                                Проверено {formatCheckedAt(report.checkedAt)}
                            </p>
                            <h2 className="mt-2 text-2xl font-black">
                                {report.canCalculate
                                    ? report.issues.length > 0
                                        ? "Есть замечания, расчёт работает"
                                        : "Всё корректно"
                                    : "Расчёт невозможен"}
                            </h2>

                            <div className="mt-5 rounded-2xl bg-white/10 p-5">
                                <p className="font-black text-white">
                                    Получено {totalReceived} записей. В расчёт
                                    принято {totalAccepted}.
                                </p>
                                <p className="mt-2 text-sm leading-6 text-pink-50/80">
                                    Не принято {totalReceived - totalAccepted}:{" "}
                                    {report.sources
                                        .filter(source => source.exclusionReason)
                                        .map(source => source.exclusionReason)
                                        .join(" ") || "исключённых записей нет."}
                                </p>
                            </div>

                            {report.issues.length > 0 ? (
                                <div className="mt-7 space-y-7">
                                    {report.issues.map((issue, index) => (
                                        <article key={`${issue.title}-${index}`}>
                                            <h3 className="text-lg font-black text-pink-100">
                                                {issue.title}
                                            </h3>
                                            <p className="mt-2 leading-7 text-pink-50/80">
                                                {issue.description}
                                            </p>
                                            <p className="mt-3 text-sm font-bold text-pink-200">
                                                Примеры
                                            </p>
                                            <ul className="mt-1 list-disc space-y-1 pl-5
                                                text-sm text-pink-50/80"
                                            >
                                                {issue.examples.map(example => (
                                                    <li key={example}>
                                                        <code>{example}</code>
                                                    </li>
                                                ))}
                                            </ul>
                                            <p className="mt-3 text-sm leading-6 text-pink-50/80">
                                                <strong className="text-white">Влияние:</strong>{" "}
                                                {issue.impact}
                                            </p>
                                            <p className="mt-1 text-sm leading-6 text-pink-50/80">
                                                <strong className="text-white">Исправление:</strong>{" "}
                                                {issue.recommendation}
                                            </p>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-4 leading-7 text-pink-50/80">
                                    В проверенных ответах проблем не обнаружено.
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="max-w-xl">
                            <h2 className="text-2xl font-black">
                                Отчёт появится здесь
                            </h2>
                            <p className="mt-3 leading-7 text-pink-100/75">
                                Нажмите «Проверить данные». Мы запросим оба
                                источника и покажем только важные замечания.
                            </p>
                        </div>
                    )}
                </section>
            </main>
        </>
    );
}
