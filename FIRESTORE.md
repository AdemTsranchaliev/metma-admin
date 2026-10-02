# Metma — Firestore справочник

Проект: виж локалния файл `SECRETS.local.md` (не се комитва).

Една Firestore база (`(default)`) за трите сайта: **BG / DE / USA**.  
Няма отделни бази и няма ASP.NET бекенд — `metma-admin` чете/пише директно.

---

## Архитектура

```
metma-admin  ──Auth──►  Firebase Authentication (email/password)
             ──CRUD──►  Cloud Firestore
             ──files─►  Firebase Storage

Сайтове (по-късно):  четат Firestore по поле site == "Bg" | "De" | "Usa"
```

**metma-de** вече чете Firestore (само `site == "De"`) през `src/lib/catalog.ts` + `src/lib/firebase/read.ts`. Няма write операции от сайта.

| Концепция | Как работи |
|-----------|------------|
| Мултисайт | **Една** база; всеки документ има поле `site` |
| Превключвател | Админ сайдбар `?site=De\|Bg\|Usa` → всички заявки филтрират по това |
| `siteId` | UUID от mock/legacy (стабилни id-та за Bg/De/Usa); вторичен идентификатор |
| Колекции | Създават се **автоматично** при първи запис — не ги правиш ръчно празни |
| Rules | Четене публично (за бъдещи storefronts); запис само логнат админ |

### Стойности на `site`

| `site` | Сайт | `siteId` |
|--------|------|----------|
| `Bg` | metma.bg | `11111111-1111-1111-1111-111111111101` |
| `De` | metma-de.com | `11111111-1111-1111-1111-111111111102` |
| `Usa` | metma-usa.com | `11111111-1111-1111-1111-111111111103` |

Кодът винаги пише **и** `site`, **и** `siteId`. Заявките филтрират по `site`.

---

## Колекции (таблици)

Всички са top-level в `(default)` database.

### 1. `products`

Продукти за каталога. Админ: **Продукти**.

| Поле | Тип | Задължително | Описание |
|------|-----|--------------|----------|
| `site` | string | да | `Bg` \| `De` \| `Usa` |
| `siteId` | string | да | UUID на сайта |
| `sku` | string | да | Артикулен номер |
| `name` | string | да | Име |
| `slug` | string | да | URL slug |
| `categoryId` | string\|null | | ID от `categories` |
| `category` | string\|null | | slug на категория (напр. `farbstoffe`) |
| `shortDescription` | string\|null | | Кратко описание |
| `description` | string\|null | | Пълно описание |
| `price` | null | | (запазено; сега null) |
| `currency` | string | | по подразбиране `EUR` |
| `imageUrl` | string\|null | | Първа снимка (URL) |
| `imageUrls` | string[] | | Галерия |
| `videoUrl` | string\|null | | Видео URL |
| `isFeatured` | bool | | На първа страница |
| `isActive` | bool | | Активен |
| `sortOrder` | number | | Подреждане |
| `createdAt` | timestamp | | при create |
| `updatedAt` | timestamp | | при save |

**Запитвания:** `where("site","==",site)` + `orderBy("sortOrder")`  
**Индекс:** `site` ASC + `sortOrder` ASC

---

### 2. `categories`

Категории продукти. Админ: **Категории**.  
При първо отваряне за сайт без данни — seed с defaults (Farbstoffe, Sets, Dekorationen).

| Поле | Тип | Описание |
|------|-----|----------|
| `site` | string | Bg / De / Usa |
| `siteId` | string | |
| `name` | string | Показвано име |
| `slug` | string | за URL `/produkte/[slug]` |
| `description` | string\|null | |
| `sortOrder` | number | |
| `isActive` | bool | |
| `updatedAt` | timestamp | |

**Индекс:** `site` ASC + `sortOrder` ASC  
Seed id формат: `cat-{site}-{slug}` напр. `cat-de-farbstoffe`

---

### 3. `pages`

CMS страници (Über uns, Kontakt и т.н.). Админ: **Страници**.

| Поле | Тип | Описание |
|------|-----|----------|
| `site` | string | |
| `siteId` | string | |
| `title` | string | |
| `slug` | string | |
| `heroTitle` | string\|null | |
| `heroSubtitle` | string\|null | |
| `bodyHtml` | string\|null | HTML съдържание |
| `metaTitle` | string\|null | SEO |
| `metaDescription` | string\|null | SEO |
| `isPublished` | bool | Публична страница |
| `createdAt` / `updatedAt` | timestamp | |

**Запитване по slug:** `site` + `slug`  
**Индекс:** `site` ASC + `slug` ASC

---

### 4. `blogPosts`

Блог публикации. Админ: **Блог**.  
Колекцията се появява в Console чак след първия пост.

| Поле | Тип | Описание |
|------|-----|----------|
| `site` | string | |
| `siteId` | string | |
| `title` | string | |
| `slug` | string | |
| `excerpt` | string\|null | Кратко |
| `bodyHtml` | string\|null | HTML |
| `coverImageUrl` | string\|null | Корица |
| `isPublished` | bool | |
| `publishedAtUtc` | string\|null | ISO дата при publish |
| `createdAt` / `updatedAt` | timestamp | |

**Запитване:** `where("site","==",site)` (без orderBy засега)

---

### 5. `qrLinks`

Кратки QR линкове. Админ: **QR кодове**.  
Публичен redirect: админ `/go/[code]?site=De` → `redirectUrl`.

| Поле | Тип | Описание |
|------|-----|----------|
| `site` | string | |
| `siteId` | string | |
| `code` | string | Кратък код в URL-а |
| `redirectUrl` | string | Къде пренасочва |
| `productId` | string\|null | Само за етикет в админа |
| `productName` | string\|null | |
| `productSlug` | string\|null | |
| `createdAtUtc` | string | ISO |
| `updatedAt` | timestamp | |

**Запитване по код:** `site` + `code`  
**Индекс:** `site` ASC + `code` ASC

---

### 6. `media`

Метаданни за качени файлове. Админ: **Медия**.  
Самият файл е в **Storage**, тук е само записът.

| Поле | Тип | Описание |
|------|-----|----------|
| `site` | string | |
| `siteId` | string | |
| `fileName` | string | Оригинално име |
| `contentType` | string | MIME |
| `sizeBytes` | number | |
| `publicUrl` | string | Download URL от Storage |
| `altText` | string\|null | |
| `storagePath` | string\|null | път в bucket |
| `updatedAt` | timestamp | |

**Storage path:** `sites/{site}/{timestamp}-{id}.{ext}`  
При изтриване на media документ → трие се и файлът в Storage (ако има `storagePath`).

---

## Какво НЕ е в Firestore

| Нещо | Къде е |
|------|--------|
| Списък сайтове Bg/De/Usa | Хардкод в `src/lib/mock-data.ts` (`MOCK_SITES`) — админ менюто „Сайтове“ е информативно |
| Логин / пароли | Firebase **Authentication**, не Firestore |
| Бинарни файлове (снимки) | **Cloudinary** (безплатно, едно място) — виж `MEDIA.md`. Fallback: локален `public`. |
| Env ключове | `metma-admin/.env.local` |

---

## Security rules

Файл: `firestore.rules`

- **read:** всеки (публично) — за бъдещи статични/Next сайтове
- **write:** само `request.auth != null` (логнат админ)

Колекции с правила: `products`, `pages`, `blogPosts`, `media`, `categories`, `qrLinks`.

Публикуване: Console → Firestore → **Rules** → paste → Publish  
или:

```bash
cd metma-admin
firebase deploy --only firestore:rules
```

---

## Индекси (composite)

Файл: `firestore.indexes.json`

| Колекция | Полета |
|----------|--------|
| `products` | `site` + `sortOrder` |
| `categories` | `site` + `sortOrder` |
| `pages` | `site` + `slug` |
| `qrLinks` | `site` + `code` |

Ако липсва индекс, грешката в админа съдържа **линк Create index** — кликни го и изчакай Status = Enabled.

Deploy на всички:

```bash
cd metma-admin
firebase deploy --only firestore:indexes
```

---

## Примери документи

### Product (De)

```json
{
  "site": "De",
  "siteId": "11111111-1111-1111-1111-111111111102",
  "sku": "MT-001",
  "name": "Eierkünstler Set",
  "slug": "eierkuenstler-set",
  "category": "sets",
  "categoryId": "cat-de-sets",
  "shortDescription": "Komplettset",
  "description": "...",
  "price": null,
  "currency": "EUR",
  "imageUrl": "https://...",
  "imageUrls": ["https://..."],
  "videoUrl": null,
  "isFeatured": true,
  "isActive": true,
  "sortOrder": 1
}
```

### QrLink (De)

```json
{
  "site": "De",
  "siteId": "11111111-1111-1111-1111-111111111102",
  "code": "ostern26",
  "redirectUrl": "https://metma-de.com/produkte/eierkuenstler-set",
  "productId": null,
  "productName": "Eierkünstler Set",
  "productSlug": "eierkuenstler-set",
  "createdAtUtc": "2026-09-23T10:00:00.000Z"
}
```

---

## Код в репото

| Файл | Роля |
|------|------|
| `src/lib/firebase/client.ts` | init app / auth / firestore / storage |
| `src/lib/firebase/store.ts` | всички CRUD функции + имена на колекции |
| `src/lib/firebase/auth.tsx` | AuthProvider / login / logout |
| `src/lib/api.ts` | превключвател Firebase vs mock (`USE_FIREBASE`) |
| `src/lib/types.ts` | TypeScript типове |
| `firestore.rules` | security rules |
| `firestore.indexes.json` | indexes |
| `firebase.json` | deploy config |
| `FIREBASE.md` | setup на проекта / Auth / env |
| **този файл** | Firestore модел и колекции |

`COLLECTIONS` константи в `store.ts`:

```
products | pages | blogPosts | media | categories | qrLinks
```

---

## Често срещани въпроси

**Защо в Console няма `blogPosts` / `qrLinks`?**  
Защото още няма записан документ. Добави пост/QR от админа — колекцията се появява сама.

**Трябва ли отделна база за BG и DE?**  
Не. Една база + поле `site`.

**Сайтовете (metma-de и т.н.) четат ли Firestore сега?**  
Още не задължително — админът вече пише там. Storefronts може да се вържат по-късно с `where("site","==","De")` и публичните rules за read.

**Грешка „query requires an index“?**  
Кликни линка от грешката → Create index → изчакай Enabled → refresh админа.
