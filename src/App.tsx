import { RouterProvider } from "react-router";

import { AppProviders } from "./providers/AppProviders";
import { router } from "./router";

/**
 * Корневой компонент объединяет инфраструктурные провайдеры
 * и маршрутизатор. Бизнес-разметки здесь намеренно нет.
 */
export function App() {
    return (
        <AppProviders>
            <RouterProvider router={router} />
        </AppProviders>
    );
}
