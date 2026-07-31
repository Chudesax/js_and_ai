import { getErrorMessage } from "@/lib/formatters";

interface ErrorScreenProps {
    error: unknown;
    onRetry?: () => void;
}

/**
 * Общий интерфейс ошибки для запросов и страниц.
 */
export function ErrorScreen({
    error,
    onRetry,
}: ErrorScreenProps) {
    return (
        <main className="grid min-h-screen place-items-center p-6">
            <section
                className="w-full max-w-xl rounded-[2rem] border
                    border-red-200 bg-white p-8 text-center shadow-xl
                    shadow-pink-200/50"
                role="alert"
                aria-live="assertive"
            >
                <div
                    className="mx-auto grid h-16 w-16 place-items-center
                        rounded-full bg-red-100 text-3xl font-black
                        text-red-600"
                    aria-hidden="true"
                >
                    !
                </div>
                <p className="mt-5 text-sm font-bold uppercase
                    tracking-[0.2em] text-red-500">
                    Ошибка
                </p>
                <h1 className="mt-2 text-2xl font-black text-pink-950">
                    Не удалось подготовить страницу
                </h1>
                <p className="mt-4 leading-7 text-slate-600">
                    {getErrorMessage(error)}
                </p>

                {onRetry && (
                    <button
                        type="button"
                        onClick={onRetry}
                        className="mt-7 rounded-full bg-pink-500 px-6 py-3
                            font-bold text-white shadow-lg shadow-pink-200
                            transition hover:bg-pink-600 focus:outline-none
                            focus:ring-4 focus:ring-pink-200"
                    >
                        Попробовать снова
                    </button>
                )}
            </section>
        </main>
    );
}
