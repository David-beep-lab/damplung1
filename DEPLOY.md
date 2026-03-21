# StartupHub – Deploy & Firebase

## Firebase (optional)

To use a real database and auth:

1. Create a project at [Firebase Console](https://console.firebase.google.com).
2. Enable **Authentication** → Sign-in method → Email/Password (and optionally Google).
3. Create **Firestore Database** (start in test mode; then add rules).
4. Create **Storage** bucket (for avatars later).
5. Copy your config from Project settings → General → Your apps.
6. Edit `js/firebase-config.js` and replace the placeholders:

```js
var firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

7. Firestore structure used by the app:
   - `users` – user documents (id = userId)
   - `profiles` – profile documents (id = userId)
   - `likes`, `superLikes`, `passed`, `favorites` – docs by userId, field `ids` (array)
   - `chats` – doc id = `userId1_userId2` (sorted), field `messages` (array)
   - `notifications` – doc by userId, field `items` (array)

If `firebase-config.js` is left with `YOUR_API_KEY`, the app uses **localStorage** only (no backend).

---

## Deploy

### Vercel

1. Push the repo to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Leave build settings as default (static site).
4. Deploy. The root is the app; `vercel.json` routes all paths to `index.html`.

### Netlify

1. Push the repo to GitHub.
2. In [Netlify](https://netlify.com): New site → Import from Git.
3. Build command: leave empty or `echo 'Static'`.
4. Publish directory: `.` (root).
5. Deploy. `netlify.toml` defines redirects and headers.

---

## Mobile

- **Bottom navigation** appears on viewport &lt; 768px (Discover, Favorites, Matches, Chat, Profile).
- **Swipe** works with touch and mouse.
- Layout is responsive; use a real device or DevTools device mode to test.
