import { useRouteError } from "react-router";

import { ErrorScreen } from "@/components/ui/ErrorScreen";

/**
 * Страховочная граница ошибок React Router.
 */
export default function RouteErrorPage() {
    const error = useRouteError();

    return (
        <ErrorScreen
            error={error}
            onRetry={() => window.location.reload()}
        />
    );
}
