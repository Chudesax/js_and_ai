import { Link } from "react-router";

export default function NotFoundPage() {
    return (
        <>
            <title>Страница не найдена | Pink Finance</title>
            <main className="grid min-h-[calc(100vh-65px)]
                place-items-center p-6 text-center">
                <div>
                    <p className="text-6xl font-black text-pink-300">
                        404
                    </p>
                    <h1 className="mt-3 text-2xl font-black
                        text-pink-950">
                        Страница не найдена
                    </h1>
                    <Link
                        to="/"
                        className="mt-6 inline-block rounded-full
                            bg-pink-500 px-6 py-3 font-bold text-white"
                    >
                        Вернуться на дашборд
                    </Link>
                </div>
            </main>
        </>
    );
}
