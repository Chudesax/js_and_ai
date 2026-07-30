/**
 * Полноэкранное состояние загрузки отчёта.
 */
export function LoadingScreen() {
    return (
        <main className="grid min-h-screen place-items-center p-6">
            <div
                className="text-center"
                role="status"
                aria-live="polite"
            >
                <div
                    className="loading-heart mb-4 text-5xl"
                    aria-hidden="true"
                >
                    ♥
                </div>
                <p className="font-semibold text-pink-700">
                    Собираем дневную статистику…
                </p>
            </div>
        </main>
    );
}
