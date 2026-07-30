import {
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";

import type { ReactNode } from "react";

/*
 * QueryClient создаётся один раз за всё время жизни приложения.
 * Если создавать его внутри компонента, кэш будет теряться
 * при повторных рендерах.
 */
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Финансовый отчёт считается свежим одну минуту.
            staleTime: 60_000,
            // После сетевой ошибки выполняем одну повторную попытку.
            retry: 1,
            // Не обновляем отчёт только из-за возврата на вкладку.
            refetchOnWindowFocus: false,
        },
    },
});

interface AppProvidersProps {
    children: ReactNode;
}

/**
 * Единое место для глобальных React-провайдеров.
 */
export function AppProviders({
    children,
}: AppProvidersProps) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
