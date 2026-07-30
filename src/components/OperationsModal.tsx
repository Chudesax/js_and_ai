import {
    useEffect,
    useRef,
} from "react";

import { formatMoney } from "../lib/formatters";

import type {
    CurrencyStatistics,
} from "../types/finance";

interface OperationsModalProps {
    statistics: CurrencyStatistics | null;
    onClose: () => void;
}

/**
 * Модальное окно успешных операций выбранной валюты.
 */
export function OperationsModal({
    statistics,
    onClose,
}: OperationsModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;

        if (!dialog || !statistics) {
            return;
        }

        dialog.showModal();

        return () => {
            if (dialog.open) {
                dialog.close();
            }
        };
    }, [statistics]);

    if (!statistics) {
        return null;
    }

    return (
        <dialog
            ref={dialogRef}
            onClose={onClose}
            onCancel={onClose}
            onClick={event => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
            className="m-auto w-[calc(100%-2rem)] max-w-2xl
                rounded-[2rem] border-0 bg-white p-0 shadow-2xl
                backdrop:bg-pink-950/35 backdrop:backdrop-blur-sm"
        >
            <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between gap-5">
                    <div>
                        <p className="text-sm font-bold uppercase
                            tracking-[0.2em] text-pink-500">
                            Детализация
                        </p>
                        <h2 className="mt-2 text-2xl font-black
                            text-pink-950">
                            Успешные операции — {statistics.currency}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Закрыть окно"
                        className="grid h-10 w-10 shrink-0
                            place-items-center rounded-full bg-pink-100
                            text-xl font-bold text-pink-700 transition
                            hover:bg-pink-200 focus:outline-none
                            focus:ring-4 focus:ring-pink-200"
                    >
                        ×
                    </button>
                </div>

                <p className="mb-5 mt-6 rounded-2xl bg-pink-50
                    px-4 py-3 text-sm font-semibold text-pink-800">
                    Показаны только успешные операции.
                </p>

                <ol className="max-h-[55vh] overflow-y-auto pr-2">
                    {statistics.operations.map((operation, index) => (
                        <li
                            key={`${operation.source}-${index}`}
                            className="flex flex-col gap-2 border-b
                                border-pink-100 py-4 first:pt-0
                                last:border-0 last:pb-0 sm:flex-row
                                sm:items-center sm:justify-between"
                        >
                            <div>
                                <p className="font-bold text-pink-950">
                                    Операция №{index + 1}
                                </p>
                                <p className="mt-1 text-xs font-semibold
                                    text-slate-400">
                                    {operation.source} · статус paid
                                </p>
                            </div>
                            <div className="sm:text-right">
                                <p className="font-black text-pink-700">
                                    {formatMoney(
                                        operation.amount,
                                        statistics.currency
                                    )}
                                </p>
                                {statistics.currency !== "USD" && (
                                    <p className="mt-1 text-xs
                                        font-semibold text-slate-400">
                                        {formatMoney(
                                            operation.amountInUsd,
                                            "USD"
                                        )}
                                    </p>
                                )}
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </dialog>
    );
}
