import {
    FINANCE_API_BASE_URL,
    FINANCE_API_KEY,
} from "@/config.js";

type Severity = "high" | "medium";

export interface ValidationIssue {
    title: string;
    severity: Severity;
    source: "Источник №1" | "Источник №2";
    description: string;
    examples: string[];
    expected: string;
    impact: string;
    recommendation: string;
}

export interface SourceCheck {
    name: "Источник №1" | "Источник №2";
    endpoint: string;
    status: number | null;
    durationMs: number;
    itemCount: number;
    isAvailable: boolean;
    summary: string;
}

export interface IncomeValidationReport {
    checkedAt: Date;
    canCalculate: boolean;
    sources: [SourceCheck, SourceCheck];
    issues: ValidationIssue[];
}

interface CapturedResponse {
    status: number;
    durationMs: number;
    data: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function unwrapData(value: unknown): unknown {
    return isRecord(value) && "data" in value ? value.data : value;
}

async function captureSource(endpoint: string): Promise<CapturedResponse> {
    const startedAt = performance.now();
    const response = await fetch(`${FINANCE_API_BASE_URL}${endpoint}`, {
        headers: {
            Accept: "application/json",
            "x-api-key": FINANCE_API_KEY,
        },
    });
    const text = await response.text();
    const durationMs = Math.round(performance.now() - startedAt);

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    try {
        return {
            status: response.status,
            durationMs,
            data: JSON.parse(text),
        };
    } catch {
        throw new Error("Сервер вернул невалидный JSON");
    }
}

function failedSource(
    name: SourceCheck["name"],
    endpoint: string,
    reason: unknown,
): { source: SourceCheck; issue: ValidationIssue } {
    const message = reason instanceof Error ? reason.message : "Неизвестная ошибка";

    return {
        source: {
            name,
            endpoint,
            status: null,
            durationMs: 0,
            itemCount: 0,
            isAvailable: false,
            summary: `Данные недоступны: ${message}.`,
        },
        issue: {
            title: `${name} недоступен`,
            severity: "high",
            source: name,
            description: `Запрос ${endpoint} завершился ошибкой.`,
            examples: [message],
            expected: "Источник отвечает HTTP 200 и возвращает валидный JSON.",
            impact: "Финансовый расчёт нельзя выполнить надёжно.",
            recommendation: "Проверить доступность endpoint и серверные логи.",
        },
    };
}

function checkSource1(captured: CapturedResponse): {
    source: SourceCheck;
    issues: ValidationIssue[];
} {
    const root = unwrapData(captured.data);
    const transactions = isRecord(root) ? root.transactions : null;
    const issues: ValidationIssue[] = [];

    if (!Array.isArray(transactions)) {
        issues.push({
            title: "Неверная структура первого источника",
            severity: "high",
            source: "Источник №1",
            description: "В ответе отсутствует массив transactions.",
            examples: ["Ожидалось поле transactions: []"],
            expected: "Объект с массивом transactions.",
            impact: "Клиент не сможет прочитать операции.",
            recommendation: "Вернуть transactions как JSON-массив.",
        });
    } else {
        const invalidItems = transactions.filter(item => {
            if (!isRecord(item)) return true;
            if (typeof item.type !== "string") return true;
            if (typeof item.amount !== "number" || !Number.isFinite(item.amount)) return true;
            return typeof item.currency !== "string" || !/^[A-Z]{3}$/.test(item.currency);
        });

        if (invalidItems.length > 0) {
            issues.push({
                title: "Некорректные операции первого источника",
                severity: "high",
                source: "Источник №1",
                description: `${invalidItems.length} из ${transactions.length} операций нарушают контракт.`,
                examples: invalidItems.slice(0, 2).map(item => JSON.stringify(item)),
                expected: "type — строка, amount — число, currency — три заглавные буквы.",
                impact: "Расчёт может остановиться или использовать неверную валюту.",
                recommendation: "Проверять поля операции перед отправкой ответа.",
            });
        }
    }

    const itemCount = Array.isArray(transactions) ? transactions.length : 0;

    return {
        source: {
            name: "Источник №1",
            endpoint: "/api/finance1",
            status: captured.status,
            durationMs: captured.durationMs,
            itemCount,
            isAvailable: true,
            summary: issues.length === 0
                ? "Структура и данные корректны."
                : "Найдены нарушения контракта.",
        },
        issues,
    };
}

function checkSource2(captured: CapturedResponse): {
    source: SourceCheck;
    issues: ValidationIssue[];
} {
    const root = unwrapData(captured.data);
    const issues: ValidationIssue[] = [];

    if (!Array.isArray(root)) {
        issues.push({
            title: "Неверная структура второго источника",
            severity: "high",
            source: "Источник №2",
            description: "Ответ должен быть массивом строк.",
            examples: ["Ожидалось: [\"300 USD\"]"],
            expected: "JSON-массив строк в формате «сумма валюта».",
            impact: "Клиент не сможет прочитать операции.",
            recommendation: "Вернуть операции как массив строк.",
        });
    } else {
        const malformed = root.filter(item =>
            typeof item !== "string" || !/^[+-]?(?:0|[1-9]\d*)(?:\.\d+)? [A-Za-z]{3}$/.test(item)
        );
        const lowercaseCurrencies = root.filter(item =>
            typeof item === "string" && /^[+-]?(?:0|[1-9]\d*)(?:\.\d+)? [a-z]{3}$/.test(item)
        );

        if (malformed.length > 0) {
            issues.push({
                title: "Некорректный формат второго источника",
                severity: "high",
                source: "Источник №2",
                description: `${malformed.length} из ${root.length} операций нельзя надёжно разобрать.`,
                examples: malformed.slice(0, 2).map(String),
                expected: "Строка в формате «300 USD».",
                impact: "Расчёт может остановиться.",
                recommendation: "Возвращать сумму и валюту в строгом формате.",
            });
        }

        if (lowercaseCurrencies.length > 0) {
            issues.push({
                title: "Валюты записаны в нижнем регистре",
                severity: "medium",
                source: "Источник №2",
                description: `${lowercaseCurrencies.length} из ${root.length} операций содержат строчные коды валют.`,
                examples: lowercaseCurrencies.slice(0, 2),
                expected: "Валютные коды в верхнем регистре: USD, EUR.",
                impact: "Текущий клиент исправляет регистр, но строгий потребитель может отклонить данные.",
                recommendation: "Нормализовать валюты на сервере перед отправкой.",
            });
        }
    }

    const itemCount = Array.isArray(root) ? root.length : 0;

    return {
        source: {
            name: "Источник №2",
            endpoint: "/api/finance2",
            status: captured.status,
            durationMs: captured.durationMs,
            itemCount,
            isAvailable: true,
            summary: issues.length === 0
                ? "Структура и данные корректны."
                : "Найдены замечания к данным.",
        },
        issues,
    };
}

export async function validateIncomeSources(): Promise<IncomeValidationReport> {
    const [source1Result, source2Result] = await Promise.allSettled([
        captureSource("/api/finance1"),
        captureSource("/api/finance2"),
    ]);

    const source1 = source1Result.status === "fulfilled"
        ? checkSource1(source1Result.value)
        : failedSource("Источник №1", "/api/finance1", source1Result.reason);
    const source2 = source2Result.status === "fulfilled"
        ? checkSource2(source2Result.value)
        : failedSource("Источник №2", "/api/finance2", source2Result.reason);
    const source1Issues = "issues" in source1 ? source1.issues : [source1.issue];
    const source2Issues = "issues" in source2 ? source2.issues : [source2.issue];
    const issues = [...source1Issues, ...source2Issues];

    return {
        checkedAt: new Date(),
        canCalculate: !issues.some(issue => issue.severity === "high"),
        sources: [source1.source, source2.source],
        issues,
    };
}
