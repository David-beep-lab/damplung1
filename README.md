# StartupHub

Платформа для поиска сооснователей, команды и талантов для стартапов.

## Возможности

- **Многоязычность** — английский, русский, украинский
- **Регистрация** — имя, тип (фаундер/талант), роль, фокус
- **Профили** — описание, статус, цели, потребности, теги
- **Панель управления** — Discover, Favorites, Matches, Chat, Profile
- **Карточки** — лайк, пасс, фильтры, поиск, сортировка
- **Чаты** — сообщения между совпадениями (matches)
- **Тёмная тема** — glass-эффект, анимации, адаптивность

## Быстрый старт

1. Откройте `index.html` в браузере или используйте локальный сервер:
   ```bash
   npx serve .
   # или
   python -m http.server 8080
   ```

2. Демо-вход: `alex@demo.com` / `demo` (и другие `*@demo.com` / `demo`)

## Подключение Firebase

1. Скопируйте `firebase-config.example.js` → `firebase-config.js`
2. Добавьте свои ключи из [Firebase Console](https://console.firebase.google.com)
3. Подключите Firebase SDK в `index.html`
4. Замените `storage.js` на версию с Firestore/Realtime Database

## Структура

```
├── index.html          # Главная страница + SPA
├── css/style.css       # Стили (тёмная тема, glass)
├── js/
│   ├── i18n.js         # Переводы (EN/RU/UK)
│   ├── storage.js      # LocalStorage (без Firebase)
│   └── app.js          # Логика приложения
├── translations.json   # Тексты для 3 языков
└── firebase-config.example.js
```
