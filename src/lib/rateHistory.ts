import type {
    RateSnapshot,
} from "@/types/finance";

const STORAGE_KEY = "pink-finance-rate-history";
const MAX_HISTORY_ITEMS = 5;

/**
 * Возвращает сохранённые расчёты от новых к старым.
 *
 * Ошибка localStorage не должна ломать основной финансовый
 * расчёт, поэтому при любой проблеме возвращается пустой массив.
 */
export function getRateHistory(): RateSnapshot[] {
    try {
        const savedValue = localStorage.getItem(STORAGE_KEY);

        if (!savedValue) {
            return [];
        }

        const parsedValue: unknown = JSON.parse(savedValue);

        if (!Array.isArray(parsedValue)) {
            return [];
        }

        return parsedValue
            .filter(isRateSnapshot)
            .slice(0, MAX_HISTORY_ITEMS);
    } catch {
        return [];
    }
}

/**
 * Сохраняет курс EUR, использованный в новом расчёте.
 *
 * @returns Обновлённая история для немедленного вывода в UI.
 */
export function saveRateSnapshot(
    calculatedAt: Date,
    euroRate: number
): RateSnapshot[] {
    if (!Number.isFinite(euroRate) || euroRate <= 0) {
        return getRateHistory();
    }

    const snapshot: RateSnapshot = {
        calculatedAt: calculatedAt.toISOString(),
        baseCurrency: "USD",
        targetCurrency: "EUR",
        rate: euroRate,
    };

    const currentHistory = getRateHistory();

    /*
     * calculatedAt создаётся один раз внутри queryFn. Проверка
     * не позволяет React StrictMode записать один расчёт дважды.
     */
    const historyWithoutDuplicate = currentHistory.filter(
        item => item.calculatedAt !== snapshot.calculatedAt
    );

    const updatedHistory = [
        snapshot,
        ...historyWithoutDuplicate,
    ].slice(0, MAX_HISTORY_ITEMS);

    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(updatedHistory)
        );
    } catch {
        // Интерфейс всё равно покажет запись текущей сессии,
        // даже если браузер запретил постоянное хранение.
    }

    return updatedHistory;
}

/**
 * Проверяет данные после JSON.parse перед использованием.
 */
function isRateSnapshot(value: unknown): value is RateSnapshot {
    if (
        value === null ||
        typeof value !== "object"
    ) {
        return false;
    }

    const snapshot = value as Partial<RateSnapshot>;

    return (
        typeof snapshot.calculatedAt === "string" &&
        !Number.isNaN(
            new Date(snapshot.calculatedAt).getTime()
        ) &&
        snapshot.baseCurrency === "USD" &&
        snapshot.targetCurrency === "EUR" &&
        typeof snapshot.rate === "number" &&
        Number.isFinite(snapshot.rate) &&
        snapshot.rate > 0
    );
}
