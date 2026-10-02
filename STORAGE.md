# Images → Firebase Storage (Blaze)

Админът качва снимки в **Firebase Storage**. Нужен е Blaze (pay-as-you-go); при малко файлове обикновено остава ~$0.

## Включване

1. [Firebase Console](https://console.firebase.google.com/project/metma-d78fd) → ⚙️ Project settings → **Usage and billing** → **Modify plan** → **Blaze**
2. **Storage** → Get started (ако още не е)
3. **Storage → Rules** → publish от `storage.rules`
4. Кажи ми — ще прекача 14-те продуктови снимки от локалния каталог в Storage и ще обновя URL-ите в Firestore

След това нови качвания от админ → Медия отиват директно в Storage.
