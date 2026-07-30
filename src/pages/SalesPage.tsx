/**
 * Заготовка страницы продаж. Функциональность добавим
 * после завершения базовой миграции.
 */
export default function SalesPage() {
    return (
        <>
            <title>Продажи | Pink Finance</title>
            <main className="mx-auto max-w-6xl p-6 lg:py-12">
                <section className="rounded-[2rem] bg-white p-8
                    shadow-xl shadow-pink-200/40">
                    <h1 className="text-3xl font-black text-pink-950">
                        Продажи
                    </h1>
                    <p className="mt-3 text-slate-500">
                        Здесь появится таблица операций.
                    </p>
                </section>
            </main>
        </>
    );
}
