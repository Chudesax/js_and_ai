import {
    NavLink,
    Outlet,
} from "react-router";

const navigationItems = [
    { to: "/", label: "Дашборд", end: true },
    { to: "/sales", label: "Продажи" },
    { to: "/settings", label: "Настройки" },
];

/**
 * Общая навигация для всех защищённых страниц приложения.
 */
export function AppLayout() {
    return (
        <>
            <nav
                className="border-b border-pink-100 bg-white/90 px-4
                    backdrop-blur"
                aria-label="Основная навигация"
            >
                <div className="mx-auto flex max-w-6xl items-center
                    justify-between gap-5 py-3">
                    <strong className="text-pink-800">
                        Pink Finance
                    </strong>
                    <ul className="flex items-center gap-1">
                        {navigationItems.map(item => (
                            <li key={item.to}>
                                <NavLink
                                    to={item.to}
                                    end={item.end}
                                    className={({ isActive }) =>
                                        `block rounded-full px-3 py-2
                                        text-sm font-bold transition ${
                                            isActive
                                                ? "bg-pink-100 text-pink-800"
                                                : "text-slate-500 hover:bg-pink-50"
                                        }`
                                    }
                                >
                                    {item.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>

            <Outlet />
        </>
    );
}
