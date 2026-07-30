import { formatRate } from "../lib/formatters";

interface RatesPanelProps {
    rates: Record<string, number>;
}

/**
 * Боковой блок курсов, использованных в расчёте.
 */
export function RatesPanel({
    rates,
}: RatesPanelProps) {
    const rateEntries = Object.entries(rates).sort(
        ([left], [right]) => left.localeCompare(right)
    );

    return (
        <aside
            aria-labelledby="rates-title"
            className="rounded-[2rem] border border-white/80 bg-white/90
                p-6 shadow-xl shadow-pink-200/40 backdrop-blur
                lg:sticky lg:top-6"
        >
            <div
                className="grid h-12 w-12 place-items-center rounded-2xl
                    bg-pink-100 text-2xl"
                aria-hidden="true"
            >
                ♡
            </div>
            <p className="mt-5 text-sm font-bold uppercase
                tracking-[0.2em] text-pink-500">
                CurrencyFreaks
            </p>
            <h2
                id="rates-title"
                className="mt-2 text-xl font-black text-pink-950"
            >
                Актуальные курсы
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
                Курсы, использованные в текущем расчёте.
            </p>

            <ul className="mt-4">
                {rateEntries.map(([currency, rate]) => (
                    <li
                        key={currency}
                        className="flex items-center justify-between gap-4
                            border-b border-pink-100 py-3 last:border-0"
                    >
                        <span className="font-bold text-slate-500">
                            {currency}
                        </span>
                        <strong className="text-right text-pink-900">
                            1 USD = {formatRate(rate)} {currency}
                        </strong>
                    </li>
                ))}
            </ul>
        </aside>
    );
}
