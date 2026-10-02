# Metma Admin → Firebase (без бекенд)

Админът говори директно с Firebase Auth, Firestore и Storage. Една база за BG / DE / USA; всеки документ има поле `site` (`Bg` | `De` | `Usa`).

## 1. Създай проект

1. [Firebase Console](https://console.firebase.google.com/) → Add project (напр. `metma-sites`).
2. Добави **Web app** → копирай config стойностите.
3. Включи:
   - **Authentication** → Sign-in method → **Email/Password** → Enable
   - **Firestore** → Create database (production mode; после deploy-ни rules)
   - **Storage** → Get started  
     Storage често изисква Blaze план; при малко трафик сметката може да остане ~$0.

## 2. Админ потребител

Authentication → Users → Add user (email + парола). С тези данни влизаш в админа.

## 3. Env за `metma-admin`

Копирай `.env.example` → `.env.local` и попълни ключовете от Firebase Web app config.

Локален бекъп на всички секрети (gitignored): **`SECRETS.local.md`**.

```env
NEXT_PUBLIC_USE_FIREBASE=true
NEXT_PUBLIC_USE_MOCK_DATA=false

NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=....firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=....appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

Рестартирай `npm run dev` (порт 3003). Без валидни ключове админът пада обратно към mock/localStorage.

## 4. Rules + indexes

От папката `metma-admin`:

```bash
npm i -g firebase-tools   # ако нямаш
firebase login
firebase use <project-id>
firebase deploy --only firestore:rules,firestore:indexes,storage
```

Или залепи съдържанието на `firestore.rules` / `storage.rules` ръчно в конзолата.

## 5. Колекции

Пълен модел на полета, индекси и примери: **[FIRESTORE.md](./FIRESTORE.md)**.

Кратко:

| Колекция     | Филтър          | Админ меню   |
|--------------|-----------------|--------------|
| `products`   | `site`          | Продукти     |
| `categories` | `site`          | Категории    |
| `pages`      | `site`          | Страници     |
| `blogPosts`  | `site`          | Блог         |
| `qrLinks`    | `site` + `code` | QR кодове    |
| `media`      | `site`          | Медия        |

Файлове: Storage path `sites/{site}/{timestamp}-{id}.ext`.

## 6. Поток

1. Логин (Firebase Auth email/password)
2. Избери сайт в сайдбара (Bg / De / Usa)
3. CRUD отива в Firestore с `site` на активния сайт
4. Upload → Storage → запис в `media`

Няма ASP.NET API. `NEXT_PUBLIC_API_BASE_URL` се игнорира при `USE_FIREBASE=true`.
