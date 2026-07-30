# Pink Finance

Дашборд на React, TypeScript и Vite. Приложение получает
финансовые данные из двух независимых API, учитывает успешные
операции, переводит суммы в USD и показывает сводный отчёт.

## Как движутся данные

```text
main.tsx
  └── App.tsx
       ├── AppProviders.tsx ─── TanStack Query
       └── router.tsx ───────── React Router
            └── DashboardPage.tsx
                 └── api/dashboard.ts
                      ├── api.js ─────── два источника
                      └── salary.js
                           └── currencyApi.js
```

## Ответственность файлов

- `src/main.tsx` — создание корня React.
- `src/App.tsx` — подключение провайдеров и роутера.
- `src/router.tsx` — централизованная карта страниц.
- `src/pages/` — полноценные страницы приложения.
- `src/components/` — переиспользуемые части интерфейса.
- `src/providers/` — глобальные React-провайдеры.
- `src/api/dashboard.ts` — адаптер между React и существующей
  логикой получения отчёта.
- `src/types/finance.ts` — финансовые TypeScript-типы.
- `src/lib/formatters.ts` — форматирование валют, дат и ошибок.
- `src/config.js` — временное хранение настроек старого API.
- `src/api.js` — универсальный `request()` и запросы финансовых
  источников; временно остаётся на JavaScript.
- `src/currencyApi.js` — один запрос к CurrencyFreaks за всеми
  необходимыми курсами; временно остаётся на JavaScript.
- `src/salary.js` — существующие проверки и финансовые расчёты;
  будет переведён на TypeScript отдельным этапом.
- `src/style.css` — Tailwind и небольшие декоративные стили.
- `vite.config.js` — настройка React, Vite и Tailwind.

## Последовательность запуска

1. Браузер загружает `src/main.tsx`.
2. React Router выбирает страницу по адресу.
3. `DashboardPage` запускает TanStack Query.
4. `api/dashboard.ts` параллельно получает два источника.
5. `salary.js` проверяет ответы и оставляет paid-операции.
6. CurrencyFreaks вызывается один раз за всеми курсами.
7. Операции группируются по валютам и переводятся в USD.
8. TanStack Query сохраняет результат в клиентском кэше.
9. React показывает сумму, карточки, курсы или ошибку.
10. Нажатие на карточку открывает компонент модального окна.

## Локальный запуск

```bash
npm install
npm run dev
```

Production-проверка:

```bash
npm run typecheck
npm run build
npm run preview
```

## Важное ограничение текущего этапа

Фронтенд пока напрямую использует ключи внешних API. Перед
production-запуском ключи и обращения к внешним финансовым
системам необходимо перенести на собственный backend.
