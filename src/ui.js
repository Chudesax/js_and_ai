const APP_SELECTOR = "#app";

/*
 * Этот модуль отвечает только за отображение.
 *
 * Он не обращается к API и не пересчитывает общую выручку.
 * Все готовые данные приходят сюда из main.js.
 */

/**
 * Отображает состояние загрузки.
 */
export function renderLoading() {
    const appElement = getAppElement();

    appElement.innerHTML = `
        <main class="grid min-h-screen place-items-center p-6">
            <div class="text-center" role="status" aria-live="polite">
                <div class="loading-heart mb-4 text-5xl" aria-hidden="true">
                    ♥
                </div>
                <p class="font-semibold text-pink-700">
                    Собираем дневную статистику…
                </p>
            </div>
        </main>
    `;
}

/**
 * Отображает рассчитанную выручку и статистику по валютам.
 *
 * @param {{
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
 * }} salary
 * @param {Date} calculationDate
 */
export function renderDashboard(
    salary,
    calculationDate
) {
    const appElement = getAppElement();
    const formattedDate = formatDate(calculationDate);
    const formattedTotal = formatMoney(
        salary.total,
        salary.currency
    );
    const operationsCount = salary.statistics.reduce(
        (total, item) => total + item.operationsCount,
        0
    );

    /*
     * Основной каркас страницы создаётся одной вставкой:
     * это уменьшает число отдельных операций с DOM.
     *
     * Вспомогательные функции ниже создают повторяющиеся части:
     * карточки валют, панель курсов и модальное окно.
     */
    appElement.innerHTML = `
        <main class="dot-pattern min-h-screen px-4 py-8 sm:px-6 lg:py-12">
            <div class="mx-auto max-w-6xl">
                <header class="mb-8 flex flex-col gap-5 rounded-[2rem]
                    border border-white/80 bg-white/85 p-6 shadow-xl
                    shadow-pink-200/50 backdrop-blur sm:flex-row
                    sm:items-center sm:justify-between sm:p-8">
                    <div>
                        <p class="mb-2 text-sm font-bold uppercase
                            tracking-[0.22em] text-pink-500">
                            Daily report
                        </p>
                        <h1 class="text-3xl font-black tracking-tight
                            text-pink-900 sm:text-4xl">
                            Розовая статистика
                            <span aria-hidden="true">🎀</span>
                        </h1>
                        <p class="mt-3 max-w-xl text-sm leading-6
                            text-slate-500 sm:text-base">
                            Выручка и валютная статистика за один день —
                            аккуратно собраны в одном месте.
                        </p>
                    </div>

                    <div class="shrink-0 rounded-2xl border border-pink-100
                        bg-pink-50 px-5 py-4 text-left sm:text-right">
                        <p class="text-xs font-bold uppercase tracking-wider
                            text-pink-500">
                            Дата расчёта
                        </p>
                        <time class="mt-1 block font-bold text-pink-950"
                            datetime="${calculationDate.toISOString()}">
                            ${formattedDate}
                        </time>
                    </div>
                </header>

                <section aria-labelledby="revenue-title"
                    class="relative mb-6 overflow-hidden rounded-[2rem]
                    bg-gradient-to-br from-pink-500 via-pink-400
                    to-rose-300 p-7 text-white shadow-xl
                    shadow-pink-300/40 sm:p-10">
                    <div class="absolute -right-10 -top-10 h-40 w-40
                        rounded-full border-[24px] border-white/15"
                        aria-hidden="true"></div>
                    <p id="revenue-title" class="text-sm font-bold
                        uppercase tracking-[0.2em] text-pink-50">
                        Общая дневная выручка
                    </p>
                    <p class="mt-3 text-4xl font-black tracking-tight
                        sm:text-6xl">
                        ${formattedTotal}
                    </p>
                    <p class="mt-4 max-w-xl text-sm leading-6
                        text-pink-50 sm:text-base">
                        Учтены только оплаченные операции.
                        Все валюты приведены к USD по единому набору курсов.
                    </p>
                </section>

                <div class="grid items-start gap-6 lg:grid-cols-[1fr_19rem]">
                    <section aria-labelledby="currencies-title"
                        class="rounded-[2rem] border border-white/80 bg-white/90
                        p-6 shadow-xl shadow-pink-200/40 backdrop-blur sm:p-8">
                        <div class="mb-6 flex flex-col gap-3 sm:flex-row
                            sm:items-end sm:justify-between">
                            <div>
                                <p class="text-sm font-bold uppercase
                                    tracking-[0.2em] text-pink-500">
                                    Поступления
                                </p>
                                <h2 id="currencies-title" class="mt-2 text-2xl
                                    font-black text-pink-950">
                                    Статистика по валютам
                                </h2>
                            </div>
                            <p class="text-sm font-semibold text-slate-500">
                                Учтено операций:
                                <strong class="text-pink-700">
                                    ${operationsCount}
                                </strong>
                            </p>
                        </div>

                        <div class="grid gap-4 md:grid-cols-2">
                            ${createCurrencyCards(
                                salary.statistics,
                                salary.rates
                            )}
                        </div>
                    </section>

                    ${createRatesPanel(salary.rates)}
                </div>

                <footer class="py-6 text-center text-xs
                    font-semibold text-pink-400">
                    Made with care, JavaScript &amp; a little pink magic
                </footer>
            </div>
        </main>

        ${createOperationsModal()}
    `;

    /*
     * HTML уже находится на странице — теперь можно найти кнопки
     * валют и назначить им обработчики клика.
     */
    setupOperationsModal(appElement, salary.statistics);
}

/**
 * Показывает ошибку расчёта непосредственно в интерфейсе.
 *
 * @param {unknown} error
 */
export function renderError(error) {
    const appElement = getAppElement();
    const errorMessage =
        error instanceof Error
            ? error.message
            : "Произошла неизвестная ошибка.";

    appElement.innerHTML = `
        <main class="grid min-h-screen place-items-center p-6">
            <section class="w-full max-w-xl rounded-[2rem] border
                border-red-200 bg-white p-8 text-center shadow-xl
                shadow-pink-200/50" role="alert" aria-live="assertive">
                <div class="mx-auto grid h-16 w-16 place-items-center
                    rounded-full bg-red-100 text-3xl font-black
                    text-red-600" aria-hidden="true">
                    !
                </div>
                <p class="mt-5 text-sm font-bold uppercase
                    tracking-[0.2em] text-red-500">
                    Ошибка расчёта
                </p>
                <h1 class="mt-2 text-2xl font-black text-pink-950">
                    Не удалось подготовить статистику
                </h1>
                <p id="error-message" class="mt-4 leading-7 text-slate-600">
                </p>
                <button id="retry-button" type="button"
                    class="mt-7 rounded-full bg-pink-500 px-6 py-3
                    font-bold text-white shadow-lg shadow-pink-200
                    transition hover:bg-pink-600 focus:outline-none
                    focus:ring-4 focus:ring-pink-200">
                    Попробовать снова
                </button>
            </section>
        </main>
    `;

    // textContent не позволяет тексту ошибки превратиться в HTML.
    appElement.querySelector("#error-message").textContent =
        errorMessage;

    appElement
        .querySelector("#retry-button")
        .addEventListener("click", () => window.location.reload());
}

function createCurrencyCards(statistics, rates) {
    // Пустой массив — нормальная ситуация, а не ошибка:
    // возможно, за день просто не было paid-операций.
    if (statistics.length === 0) {
        return `
            <p class="rounded-3xl border border-dashed border-pink-200
                bg-pink-50 p-6 text-center text-sm font-semibold
                text-slate-500 md:col-span-2 xl:col-span-3">
                За выбранный день оплаченных поступлений нет.
            </p>
        `;
    }

    return statistics
        .map(statisticsItem =>
            createCurrencyCard(statisticsItem, rates)
        )
        .join("");
}

/**
 * Создаёт одну интерактивную карточку валюты.
 *
 * Карточка сделана элементом button, а не обычным div:
 * так она доступна с клавиатуры и понятна скринридерам.
 */
function createCurrencyCard(statistics, rates) {
    const originalAmount = formatMoney(
        statistics.amount,
        statistics.currency
    );
    const amountInUsd = formatMoney(
        statistics.amountInUsd,
        "USD"
    );
    const operationLabel =
        formatOperationCount(statistics.operationsCount);
    const conversionFooter =
        createConversionFooter(statistics, rates);

    return `
        <button type="button" data-currency="${statistics.currency}"
            aria-label="Открыть успешные операции в ${statistics.currency}"
            class="w-full rounded-3xl border border-pink-100 bg-pink-50/60
            p-5 text-left transition duration-200 hover:-translate-y-1
            hover:border-pink-300 hover:shadow-lg hover:shadow-pink-100
            focus:outline-none focus:ring-4 focus:ring-pink-200">
            <div class="flex items-start justify-between gap-4">
                <div class="grid h-12 w-12 place-items-center rounded-2xl
                    bg-pink-100 text-sm font-black text-pink-700">
                    ${statistics.currency}
                </div>
                <span class="rounded-full bg-white px-3 py-1 text-xs
                    font-bold text-pink-600 shadow-sm">
                    ${operationLabel}
                </span>
            </div>

            <p class="mt-5 text-3xl font-black tracking-tight
                text-pink-950">
                ${originalAmount}
            </p>
            <p class="mt-1 text-sm font-semibold text-slate-500">
                Получено в исходной валюте
            </p>

            ${conversionFooter ?? `
                <div class="mt-5 border-t border-pink-100 pt-4">
                    <div class="flex items-center justify-between
                        gap-4 text-sm">
                        <span class="text-slate-500">В долларах</span>
                        <strong class="text-pink-800">
                            ${amountInUsd}
                        </strong>
                    </div>
                </div>
            `}

            <p class="mt-4 text-xs font-bold text-pink-500">
                Нажмите, чтобы посмотреть операции →
            </p>
        </button>
    `;
}

/**
 * Формирует нижнюю строку валютной карточки.
 *
 * Для USD по заданию показывается пересчёт в EUR.
 * Для EUR и остальных валют функция возвращает null,
 * после чего карточка показывает эквивалент в USD.
 */
function createConversionFooter(statistics, rates) {
    if (statistics.currency === "USD") {
        const euroRate = rates.EUR;

        if (!Number.isFinite(euroRate) || euroRate <= 0) {
            throw new Error(
                "Не найден актуальный курс EUR для пересчёта USD."
            );
        }

        return `
            <div class="mt-5 border-t border-pink-100 pt-4">
                <div class="flex items-center justify-between gap-4 text-sm">
                    <span class="text-slate-500">
                        В евро, актуальный пересчёт
                    </span>
                    <strong class="text-pink-800">
                        ${formatMoney(
                            statistics.amount * euroRate,
                            "EUR"
                        )}
                    </strong>
                </div>
            </div>
        `;
    }

    return null;
}

/**
 * Создаёт независимый боковой блок со всеми курсами,
 * которые фактически использовались в текущем расчёте.
 */
function createRatesPanel(rates) {
    const rateRows = Object.entries(rates)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([currency, rate]) => `
            <li class="flex items-center justify-between gap-4
                border-b border-pink-100 py-3 last:border-0">
                <span class="font-bold text-slate-500">${currency}</span>
                <strong class="text-right text-pink-900">
                    1 USD = ${formatRate(rate)} ${currency}
                </strong>
            </li>
        `)
        .join("");

    return `
        <aside aria-labelledby="rates-title"
            class="rounded-[2rem] border border-white/80 bg-white/90
            p-6 shadow-xl shadow-pink-200/40 backdrop-blur lg:sticky
            lg:top-6">
            <div class="grid h-12 w-12 place-items-center rounded-2xl
                bg-pink-100 text-2xl" aria-hidden="true">
                ♡
            </div>
            <p class="mt-5 text-sm font-bold uppercase tracking-[0.2em]
                text-pink-500">
                CurrencyFreaks
            </p>
            <h2 id="rates-title" class="mt-2 text-xl font-black
                text-pink-950">
                Актуальные курсы
            </h2>
            <p class="mt-2 text-sm leading-6 text-slate-500">
                Курсы, использованные в текущем расчёте.
            </p>
            <ul class="mt-4">${rateRows}</ul>
        </aside>
    `;
}

/**
 * Создаёт пустую оболочку стандартного HTML-элемента dialog.
 * Заголовок и список операций добавляются при выборе валюты.
 */
function createOperationsModal() {
    return `
        <dialog id="operations-modal"
            class="m-auto w-[calc(100%-2rem)] max-w-2xl rounded-[2rem]
            border-0 bg-white p-0 shadow-2xl backdrop:bg-pink-950/35
            backdrop:backdrop-blur-sm">
            <div class="p-6 sm:p-8">
                <div class="flex items-start justify-between gap-5">
                    <div>
                        <p class="text-sm font-bold uppercase
                            tracking-[0.2em] text-pink-500">
                            Детализация
                        </p>
                        <h2 id="modal-title" class="mt-2 text-2xl
                            font-black text-pink-950">
                        </h2>
                    </div>
                    <button id="modal-close" type="button"
                        aria-label="Закрыть окно"
                        class="grid h-10 w-10 shrink-0 place-items-center
                        rounded-full bg-pink-100 text-xl font-bold
                        text-pink-700 transition hover:bg-pink-200
                        focus:outline-none focus:ring-4 focus:ring-pink-200">
                        ×
                    </button>
                </div>
                <div id="modal-content" class="mt-6"></div>
            </div>
        </dialog>
    `;
}

/**
 * Связывает карточки валют с модальным окном.
 *
 * @param {HTMLElement} appElement
 * @param {Array<object>} statistics
 */
function setupOperationsModal(appElement, statistics) {
    const modal = appElement.querySelector("#operations-modal");
    const modalTitle = appElement.querySelector("#modal-title");
    const modalContent = appElement.querySelector("#modal-content");
    const closeButton = appElement.querySelector("#modal-close");

    for (const card of appElement.querySelectorAll("[data-currency]")) {
        card.addEventListener("click", () => {
            // Код выбранной валюты хранится в data-currency.
            // По нему находим соответствующую группу операций.
            const selectedStatistics = statistics.find(
                item => item.currency === card.dataset.currency
            );

            if (!selectedStatistics) {
                return;
            }

            modalTitle.textContent =
                `Успешные операции — ${selectedStatistics.currency}`;
            modalContent.innerHTML =
                createOperationsList(selectedStatistics);

            // showModal(), в отличие от show(), открывает настоящее
            // модальное окно и блокирует взаимодействие с фоном.
            modal.showModal();
        });
    }

    closeButton.addEventListener("click", () => modal.close());

    // Нажатие непосредственно на затемнённую область dialog
    // также закрывает окно.
    modal.addEventListener("click", event => {
        if (event.target === modal) {
            modal.close();
        }
    });
}

/**
 * Создаёт список успешных операций выбранной валюты.
 * В статистику ранее попали только операции со статусом paid.
 */
function createOperationsList(statistics) {
    const operationRows = statistics.operations
        .map((operation, index) => `
            <li class="flex flex-col gap-2 border-b border-pink-100
                py-4 first:pt-0 last:border-0 last:pb-0
                sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p class="font-bold text-pink-950">
                        Операция №${index + 1}
                    </p>
                    <p class="mt-1 text-xs font-semibold text-slate-400">
                        ${operation.source} · статус paid
                    </p>
                </div>
                <div class="sm:text-right">
                    <p class="font-black text-pink-700">
                        ${formatMoney(
                            operation.amount,
                            statistics.currency
                        )}
                    </p>
                    ${
                        statistics.currency === "USD"
                            ? ""
                            : `<p class="mt-1 text-xs font-semibold
                                text-slate-400">
                                ${formatMoney(
                                    operation.amountInUsd,
                                    "USD"
                                )}
                            </p>`
                    }
                </div>
            </li>
        `)
        .join("");

    return `
        <p class="mb-5 rounded-2xl bg-pink-50 px-4 py-3 text-sm
            font-semibold text-pink-800">
            Показаны только успешные операции.
        </p>
        <ol class="max-h-[55vh] overflow-y-auto pr-2">
            ${operationRows}
        </ol>
    `;
}

/**
 * Форматирует Date по российским правилам отображения.
 */
function formatDate(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
        throw new TypeError("Некорректная дата расчёта.");
    }

    return new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

/**
 * Использует встроенный Intl вместо ручного добавления
 * символов $, € и разделителей разрядов.
 */
function formatMoney(total, currency) {
    if (!Number.isFinite(total)) {
        throw new TypeError(
            "Результат расчёта должен быть конечным числом."
        );
    }

    return new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
    }).format(total);
}

/**
 * Курс выводится максимум с шестью знаками после запятой:
 * этого достаточно для интерфейса, исходное число не изменяется.
 */
function formatRate(rate) {
    if (!Number.isFinite(rate) || rate <= 0) {
        throw new TypeError(
            "Курс валюты должен быть положительным числом."
        );
    }

    return new Intl.NumberFormat("ru-RU", {
        maximumFractionDigits: 6,
    }).format(rate);
}

/**
 * Выбирает правильную форму русского слова "операция".
 */
function formatOperationCount(count) {
    const lastTwoDigits = count % 100;
    const lastDigit = count % 10;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return `${count} операций`;
    }

    if (lastDigit === 1) {
        return `${count} операция`;
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
        return `${count} операции`;
    }

    return `${count} операций`;
}

/**
 * Возвращает корневой контейнер приложения.
 * Его отсутствие — ошибка разметки index.html.
 */
function getAppElement() {
    const appElement = document.querySelector(APP_SELECTOR);

    if (!appElement) {
        throw new Error(
            `Не найден корневой элемент ${APP_SELECTOR}.`
        );
    }

    return appElement;
}
