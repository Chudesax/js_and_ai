import { getUsdRates } from "@/currencyApi.js";

/**
 * Рассчитывает общую дневную выручку
 * и приводит все суммы к USD.
 *
 * @param {object} source1
 * @param {string[]} source2
 *
 * @returns {Promise<{
 *     total: number,
 *     currency: "USD",
 *     statistics: Array<{
 *         currency: string,
 *         amount: number,
 *         operationsCount: number,
 *         amountInUsd: number,
 *         usdRate: number,
 *         operations: Array<{
 *             amount: number,
 *             amountInUsd: number,
 *             source: string
 *         }>
 *     }>,
 *     rates: Record<string, number>
 * }>}
 */
export async function dailySalaryCalc(
    source1,
    source2
) {
    validateSources(source1, source2);

    /*
     * Сначала собираем все подходящие операции
     * в едином внутреннем формате:
     *
     * {
     *     amount: 100,
     *     currency: "EUR",
     *     source: "Источник №1"
     * }
     *
     * После этого дальнейшему расчёту уже не важно,
     * в каком исходном формате пришла операция.
     */
    const transactions = [
        ...parseSource1(source1),
        ...parseSource2(source2),
    ];

    if (transactions.length === 0) {
        return {
            total: 0,
            currency: "USD",
            statistics: [],
            rates: {
                USD: 1,
            },
        };
    }

    // Получаем список всех валют,
    // встречающихся в транзакциях.
    const currencies = [
        ...transactions.map(
            transaction => transaction.currency
        ),
        // EUR нужен для пересчёта долларовой карточки.
        // Он добавляется в тот же единственный запрос курсов.
        "EUR",
    ];

    // Выполняется только один запрос к CurrencyFreaks
    // сразу для всех необходимых валют.
    const rates = await getUsdRates(currencies);

    // Один и тот же набор курсов используется и для итоговой
    // суммы, и для статистических карточек интерфейса.
    const statistics = createCurrencyStatistics(
        transactions,
        rates
    );

    /*
     * Итог считаем по неокруглённым значениям операций.
     * Округление статистических карточек не должно менять
     * точность общей суммы даже на один цент.
     */
    const totalInUsd = transactions.reduce(
        (total, transaction) =>
            total +
            transaction.amount /
                rates[transaction.currency],
        0
    );

    return {
        // Округляем итоговую денежную сумму
        // до двух знаков после запятой.
        total: roundMoney(totalInUsd),
        currency: "USD",
        statistics,
        rates,
    };
}

/**
 * Группирует поступления по исходной валюте.
 *
 * Помимо исходной суммы сохраняются количество операций,
 * эквивалент в USD и курс, который участвовал в расчёте.
 * Благодаря этому интерфейс не делает повторный запрос курсов.
 *
 * @param {Array<{ amount: number, currency: string }>} transactions
 * @param {Record<string, number>} rates
 * @returns {Array<{
 *     currency: string,
 *     amount: number,
 *     operationsCount: number,
 *     amountInUsd: number,
 *     usdRate: number,
 *     operations: Array<{
 *         amount: number,
 *         amountInUsd: number,
 *         source: string
 *     }>
 * }>}
 */
function createCurrencyStatistics(transactions, rates) {
    /*
     * Map удобно использовать для группировки:
     * ключом будет код валюты ("USD", "EUR"),
     * значением — накопленная статистика этой валюты.
     */
    const statisticsByCurrency = new Map();

    for (const transaction of transactions) {
        const rate = rates[transaction.currency];

        if (!Number.isFinite(rate) || rate <= 0) {
            throw new Error(
                `Не найден курс валюты ${transaction.currency}.`
            );
        }

        /*
         * Если валюта встречается впервые, создаём пустую группу.
         * Если уже встречалась — берём ранее накопленные данные.
         */
        const currentStatistics =
            statisticsByCurrency.get(transaction.currency) ?? {
                currency: transaction.currency,
                amount: 0,
                operationsCount: 0,
                amountInUsd: 0,
                usdRate: rate,
                operations: [],
            };

        currentStatistics.amount += transaction.amount;
        currentStatistics.operationsCount += 1;

        /*
         * CurrencyFreaks возвращает курс вида:
         * 1 USD = rate единиц исходной валюты.
         * Поэтому для перевода исходной суммы в USD делим её
         * на полученный курс.
         */
        currentStatistics.amountInUsd +=
            transaction.amount / rate;
        /*
         * Сохраняем и отдельную операцию. Этот список нужен UI,
         * чтобы открыть детализацию в модальном окне без нового
         * запроса к финансовому серверу.
         */
        currentStatistics.operations.push({
            amount: transaction.amount,
            amountInUsd: roundMoney(
                transaction.amount / rate
            ),
            source: transaction.source,
        });

        statisticsByCurrency.set(
            transaction.currency,
            currentStatistics
        );
    }

    /*
     * Превращаем Map обратно в обычный массив:
     * его удобно перебирать при создании карточек.
     */
    return [...statisticsByCurrency.values()]
        .map(item => ({
            ...item,
            amount: roundMoney(item.amount),
            amountInUsd: roundMoney(item.amountInUsd),
        }))
        .sort((left, right) =>
            left.currency.localeCompare(right.currency)
        );
}

/**
 * Проверяет общую структуру источников.
 */
function validateSources(source1, source2) {
    // Проверяем общую структуру до циклов, чтобы при повреждённом
    // ответе API остановиться с точным сообщением об ошибке.
    if (source1 === undefined || source2 === undefined) {
        throw new Error(
            "Необходимо передать source1 и source2."
        );
    }

    if (
        source1 === null ||
        typeof source1 !== "object" ||
        Array.isArray(source1)
    ) {
        throw new TypeError(
            "source1 должен быть объектом."
        );
    }

    if (!Array.isArray(source1.transactions)) {
        throw new TypeError(
            "source1.transactions должен быть массивом."
        );
    }

    if (!Array.isArray(source2)) {
        throw new TypeError(
            "source2 должен быть массивом."
        );
    }
}

/**
 * Обрабатывает первый источник.
 *
 * Учитываются только транзакции со статусом paid.
 */
function parseSource1(source1) {
    const result = [];

    for (const transaction of source1.transactions) {
        // Даже один повреждённый элемент означает, что ответ API
        // нельзя считать надёжным для финансового расчёта.
        if (
            transaction === null ||
            typeof transaction !== "object" ||
            Array.isArray(transaction)
        ) {
            throw new TypeError(
                "Каждая транзакция source1 должна быть объектом."
            );
        }

        // pending и rejected не учитываются.
        if (transaction.type !== "paid") {
            continue;
        }

        validateAmount(
            transaction.amount,
            "source1"
        );

        const currency = normalizeCurrency(
            transaction.currency,
            "source1"
        );

        result.push({
            amount: transaction.amount,
            currency,
            source: "Источник №1",
        });
    }

    return result;
}

/**
 * Обрабатывает второй источник.
 *
 * Ожидаемый формат каждого элемента:
 * "300 EUR"
 */
function parseSource2(source2) {
    const result = [];

    for (const transaction of source2) {
        if (typeof transaction !== "string") {
            throw new TypeError(
                "Каждый элемент source2 должен быть строкой."
            );
        }

        /*
         * Регулярное выражение /\s+/ допускает один или несколько
         * пробелов: "300 USD" и "300   USD" обработаются одинаково.
         */
        const parts = transaction.trim().split(/\s+/);

        if (parts.length !== 2) {
            throw new Error(
                `Некорректный формат source2: "${transaction}". ` +
                `Ожидался формат "300 USD".`
            );
        }

        const [amountString, currencyString] = parts;

        // Запрещаем пустые и состоящие только
        // из пробелов значения.
        if (amountString.trim() === "") {
            throw new TypeError(
                "Сумма в source2 не может быть пустой."
            );
        }

        const amount = Number(amountString);

        validateAmount(amount, "source2");

        const currency = normalizeCurrency(
            currencyString,
            "source2"
        );

        result.push({
            amount,
            currency,
            source: "Источник №2",
        });
    }

    return result;
}

/**
 * Проверяет сумму транзакции.
 */
function validateAmount(amount, sourceName) {
    if (
        typeof amount !== "number" ||
        !Number.isFinite(amount)
    ) {
        throw new TypeError(
            `Некорректный amount в ${sourceName}: ` +
            `${String(amount)}. Ожидалось конечное число.`
        );
    }
}

/**
 * Нормализует код валюты.
 */
function normalizeCurrency(
    currency,
    sourceName
) {
    if (
        typeof currency !== "string" ||
        currency.trim() === ""
    ) {
        throw new TypeError(
            `Валюта в ${sourceName} должна быть ` +
            `непустой строкой.`
        );
    }

    return currency.trim().toUpperCase();
}

/**
 * Округляет денежную сумму до двух знаков.
 *
 * EPSILON помогает уменьшить вероятность ошибки
 * при округлении чисел с плавающей точкой.
 */
function roundMoney(value) {
    return Math.round(
        (value + Number.EPSILON) * 100
    ) / 100;
}
