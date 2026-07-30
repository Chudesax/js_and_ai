import {
    createBrowserRouter,
} from "react-router";

import { AppLayout } from "./layouts/AppLayout";
import RouteErrorPage from "./pages/RouteErrorPage";

/**
 * Централизованная карта страниц приложения.
 *
 * lazy загружает код страницы только при первом переходе на неё.
 * Общий layout и экран критической ошибки остаются в стартовом
 * файле, потому что нужны для любого маршрута.
 */
export const router = createBrowserRouter(
    [
        {
            path: "/",
            Component: AppLayout,
            ErrorBoundary: RouteErrorPage,
            children: [
                {
                    index: true,
                    lazy: async () => ({
                        Component: (
                            await import("./pages/DashboardPage")
                        ).default,
                    }),
                },
                {
                    path: "sales",
                    lazy: async () => ({
                        Component: (
                            await import("./pages/SalesPage")
                        ).default,
                    }),
                },
                {
                    path: "settings",
                    lazy: async () => ({
                        Component: (
                            await import("./pages/SettingsPage")
                        ).default,
                    }),
                },
                {
                    path: "*",
                    lazy: async () => ({
                        Component: (
                            await import("./pages/NotFoundPage")
                        ).default,
                    }),
                },
            ],
        },
    ],
    {
        /*
         * Vite автоматически подставляет:
         * "/" для собственного сервера и разработки;
         * "/js_and_ai/" для GitHub Pages mode.
         */
        basename: import.meta.env.BASE_URL,
    }
);
