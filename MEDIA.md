# Едно общо място за снимки — Cloudinary (безплатно)

Без Firebase Blaze / $30. Всички сайтове (BG/DE/USA) качват в **един** Cloudinary акаунт.
Админ → Медия → качване → URL се записва в Firestore.

## 1. Безплатен акаунт

1. [cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Потвърди email
3. Dashboard → **Account Details** / **API Keys** → копирай:
   - Cloud name
   - API Key
   - API Secret

## 2. Env в `metma-admin/.env.local`

```env
CLOUDINARY_CLOUD_NAME=xxxxx
CLOUDINARY_API_KEY=xxxxx
CLOUDINARY_API_SECRET=xxxxx
```

Рестартирай `npm run dev` (порт 3003).

## 3. Ползване

- Админ → **Медия** → качи файл
- Файловете отиват в папка `metma/De` (или Bg / Usa)
- Публичен HTTPS URL → продукт / блог / галерия

Free tier е достатъчен за продуктов каталог (лимити на cloudinary.com/pricing — Free).

## Оптимизация

При качване: max **1600px**, `quality: auto:good`.  
При показване на сайта: URL с `f_auto,q_auto:good` (WebP/AVIF автоматично).

Ако Cloudinary **не** е сетнат, качването пада към локален `metma-de/public` (само за dev).
