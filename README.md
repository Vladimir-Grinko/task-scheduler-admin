# Task Scheduler Admin Panel

[![Vue.js](https://img.shields.io/badge/-Vue.js-090909?style=for-the-badge&logo=vue-dot-js&logoColor=42b883)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/-TypeScript-090909?style=for-the-badge&logo=TypeScript&logoColor=007acc)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/-Vite-090909?style=for-the-badge&logo=Vite&logoColor=646CFF)](https://vitejs.dev/)
[![Naive UI](https://img.shields.io/badge/-Naive_UI-090909?style=for-the-badge&logo=vue-dot-js&logoColor=2080F0)](https://www.naiveui.com/)
[![Pinia](https://img.shields.io/badge/-Pinia-090909?style=for-the-badge&logo=pinia&logoColor=E83F6F)](https://pinia.vuejs.org/)
[![Vue Router](https://img.shields.io/badge/-Vue_Router-090909?style=for-the-badge&logo=vue-dot-js&logoColor=42b883)](https://router.vuejs.org/)

Панель администрирования планировщика задач

## Технологии

- **Vue 3** - Фреймворк
- **TypeScript** - Типизация
- **Vite** - Сборщик
- **Naive UI** - UI компоненты
- **Pinia** - State management
- **Vue Router** - Роутинг

## Установка

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build
```

## Структура проекта

src/
├── assets/ # Стили и изображения
├── components/ # Vue компоненты
│ ├── layout/ # Макет приложения
│ ├── tabs/ # Табы навигации
│ └── common/ # Общие компоненты
├── router/ # Роутинг
├── stores/ # Pinia store
├── types/ # TypeScript типы
└── App.vue # Корневой компонент

## 📸 Скриншоты

![Планировка](screenshots/main.png)
![Ручная загрузка](screenshots/manual.png)
![Уведомления](screenshots/notifications.png)
