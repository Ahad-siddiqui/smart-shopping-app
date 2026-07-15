# Smart Shopping — Mobile App

React Native (Expo) mobile client for the **Smart Shopping** marketplace, built to talk to the exact same backend as the web app (https://github.com/Ahad-siddiqui/smart-shopping).

## Features (Phase 1 + Phase 2, all included)

- ✅ Login / Sign up (JWT auth, same as web)
- ✅ Home — category grid, featured ads, per-category rows
- ✅ Category browsing & search results
- ✅ Product details (gallery, seller info, favourite toggle)
- ✅ Post Ad (photos, category, condition, price, location) + posting-fee payment step (EasyPaisa / Bank Alfalah, manual verification)
- ✅ My Ads dashboard — edit, delete, mark as sold, resume payment
- ✅ Favourites
- ✅ Chat — real-time-feeling messaging via polling (backend has no persistent sockets, same as web)
- ✅ Notifications — mark read/unread, delete
- ✅ Saved Searches — save a search/category, revisit later
- ✅ Basic Admin Panel — dashboard stats, approve/reject pending ads, verify/reject payments, ban/unban/delete users, resolve/dismiss reports
- ✅ Profile + logout

Not built (web/admin-console only, by design — low value on mobile): category management, site-wide settings editor, analytics charts.

## Important: Expo Go SDK version

This project is pinned to **Expo SDK 54**, matching a common Expo Go client version (54.0.x) currently on the Play Store. If you still see "Project is incompatible with this version of Expo Go":

1. Open Expo Go → **Settings** tab → scroll to **App Info** → note the **Supported SDK** number.
2. Tell me that number and I'll re-pin the project's `expo` version (and matching react/react-native versions) to match exactly.

You can also run `npx expo start -c` to clear the Metro cache if you've just changed versions.

## 1. Point the app at your backend

Open `src/utils/constants.js` and set `API_URL`:

```js
// Android emulator:
export const API_URL = 'http://10.0.2.2:5000/api';

// Physical phone with Expo Go (same Wi-Fi as your computer):
export const API_URL = 'http://<your-computer-LAN-IP>:5000/api';

// Deployed backend:
export const API_URL = 'https://your-backend.example.com/api';
```

Also make sure your backend's CORS config (or lack of it — CORS doesn't apply to native apps, only browsers) and any `.env` (Mongo URI, JWT secret, ImageKit keys) are already set up as in the original repo's `backend/README.md`.

## 2. Install & run

```bash
cd smart-shopping-mobile
npm install
npx expo start
```

- Press `a` for Android emulator, `i` for iOS simulator (Mac only), or scan the QR code with the **Expo Go** app on your phone.
- Make sure your backend server is actually running (`npm run dev` inside the `backend` folder of the web project) and reachable at the `API_URL` you set above.

## Admin access

The Admin Panel link only appears on the Profile screen for accounts with `role: "admin"` in the database (same as the web app — set via the backend's `npm run seed:admin` or by promoting a user directly in MongoDB).

## Project structure

```
src/
  components/   Reusable UI (ProductCard, CategoryGrid, Loader, ErrorMessage)
  hooks/         useAuth
  navigation/    AppNavigator (bottom tabs + stack)
  screens/       One file per screen
  services/      axios API calls — same endpoints/contracts as the web app's src/services
  store/         Redux Toolkit (auth slice, persisted via AsyncStorage)
  utils/         constants (API_URL, enums, etc.)
```

## Notes

- Auth token is stored in `AsyncStorage` (the RN equivalent of the web app's `localStorage`) and attached to every request as `Authorization: Bearer <token>`.
- Browsing (Home, categories, search, product details) works without logging in — same as the web app. Posting an ad or viewing your profile prompts login first.
- Image picking uses `expo-image-picker`; uploaded the same way as web (`multipart/form-data`, field name `images`).
