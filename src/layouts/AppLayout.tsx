import {
    useEffect,
    useRef,
    useState,
} from "react";
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
    const [logoClicks, setLogoClicks] = useState(0);
    const [isMascotVisible, setIsMascotVisible] = useState(false);
    const hideMascotTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => () => {
        if (hideMascotTimer.current) {
            clearTimeout(hideMascotTimer.current);
        }
    }, []);

    function handleLogoClick() {
        const nextClickCount = logoClicks + 1;

        if (nextClickCount < 5) {
            setLogoClicks(nextClickCount);
            return;
        }

        setLogoClicks(0);
        setIsMascotVisible(true);

        if (hideMascotTimer.current) {
            clearTimeout(hideMascotTimer.current);
        }

        hideMascotTimer.current = setTimeout(() => {
            setIsMascotVisible(false);
        }, 6000);
    }

    return (
        <>
            <nav
                className="border-b border-pink-100 bg-white/90 px-4
                    backdrop-blur"
                aria-label="Основная навигация"
            >
                <div className="mx-auto flex max-w-6xl items-center
                    justify-between gap-5 py-3">
                    <button
                        type="button"
                        className="cursor-default rounded-md font-bold
                            text-pink-800 outline-none focus-visible:ring-2
                            focus-visible:ring-pink-400 focus-visible:ring-offset-2"
                        onClick={handleLogoClick}
                        aria-label="Pink Finance"
                    >
                        Pink Finance
                    </button>
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

            {isMascotVisible ? (
                <aside
                    className="guinea-pig-surprise fixed bottom-5 left-5 z-50
                        flex max-w-[calc(100vw-2.5rem)] items-center gap-3
                        rounded-3xl border border-pink-200 bg-white p-2 pr-4
                        shadow-[0_18px_50px_rgb(131_24_67_/_20%)]"
                    role="status"
                    aria-live="polite"
                >
                    <img
                        className="size-20 rounded-2xl object-cover"
                        src="/guinea-pig.png"
                        alt="Милая морская свинка"
                        width="80"
                        height="80"
                    />
                    <div>
                        <p className="font-bold text-pink-800">
                            Пи-пи! Ты меня нашёл 💗
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Финансовая подушка одобрена.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="ml-1 self-start rounded-full px-2 py-1
                            text-sm text-slate-400 transition hover:bg-pink-50
                            hover:text-pink-700 focus-visible:outline-2
                            focus-visible:outline-pink-400"
                        onClick={() => setIsMascotVisible(false)}
                        aria-label="Спрятать морскую свинку"
                    >
                        ×
                    </button>
                </aside>
            ) : null}
        </>
    );
}
