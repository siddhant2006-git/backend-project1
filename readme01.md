# Backend Project 01 — Full Structure & Frontend Integration Guide

A **YouTube + Twitter style backend** (video sharing + tweets + comments + subscriptions + playlists + likes) built with **Node.js, Express 5, MongoDB/Mongoose, JWT and Cloudinary**.

This document is written so that **a frontend can be built directly from it**. It contains the real folder structure, every database model, every working API endpoint with exact request/response shapes, the auth flow, and a list of what is **not wired up yet** (so you don't build UI against routes that don't exist).

---

## Table of Contents

1. [Quick Facts](#1-quick-facts)
2. [Folder Structure (actual)](#2-folder-structure-actual)
3. [Tech Stack & Dependencies](#3-tech-stack--dependencies)
4. [Environment Variables](#4-environment-variables)
5. [How to Run](#5-how-to-run)
6. [Request Lifecycle](#6-request-lifecycle)
7. [Database Models (Schemas)](#7-database-models-schemas)
8. [Response Format](#8-response-format)
9. [Authentication Flow](#9-authentication-flow)
10. [API Reference — Live Endpoints](#10-api-reference--live-endpoints)
11. [Controllers That Exist But Have NO Routes](#11-controllers-that-exist-but-have-no-routes)
12. [Known Bugs / Gotchas Before You Build Frontend](#12-known-bugs--gotchas-before-you-build-frontend)
13. [Building the Frontend](#13-building-the-frontend)
14. [Suggested Frontend Pages & Which API They Use](#14-suggested-frontend-pages--which-api-they-use)
15. [HTTP Status Codes Used](#15-http-status-codes-used)
16. [Aggregation Notes](#16-aggregation-notes)
17. [Roadmap / TODO](#17-roadmap--todo)

---

## 1. Quick Facts

| Item | Value |
| --- | --- |
| Entry point | `src/index.js` |
| Express app | `src/app.js` |
| Base URL (dev) | `http://localhost:8008` (from `PORT` in `src/.env`; falls back to `8001`) |
| Mounted route prefix | `/api/users` → `src/routes/user_routes.js` |
| Database | MongoDB, database name `krish` (from `src/constants.js`) |
| Module system | ESM (`"type": "module"`) |
| Auth | JWT access token + refresh token, sent as **httpOnly cookies** *and* in the JSON body |
| File uploads | `multer` → local `public/temp` → `cloudinary` → local file deleted |
| Node version used | v26.5.0 / npm 12.2.0 |

---

## 2. Folder Structure (actual)

```text
backend-project1/
├── .excalidraw                       # design/diagram scratch file
├── .gitignore                        # ignores .env, .env.*, node_modules/
├── .prettierrc / .prettierignore
├── .vscode/settings.json
├── aggrigation.md                    # personal notes on MongoDB aggregation
├── ERROR.MD                          # personal notes on HTTP status codes
├── readme.md                         # old generic boilerplate readme
├── readme01.md                       # <— THIS FILE
├── package.json
├── package-lock.json
│
├── middlewares/                      # NOTE: lives at ROOT, not inside src/
│   ├── authmiddleware.js             # verifyJwt — protects routes
│   └── multers_middleware.js         # upload — multer diskStorage config
│
├── postman/
│   └── collections/New Collection/   # Postman collection (yaml format)
│
├── public/                           # served statically by express.static("public")
│   ├── structure.txt
│   └── temp/                         # multer dump folder (.gitkeep + leftover uploads)
│
└── src/
    ├── .env                          # SECRETS — git-ignored
    ├── index.js                      # loads env → connectDB() → app.listen()
    ├── app.js                        # express app, cors, parsers, routes, error handler
    ├── constants.js                  # export const DB_NAME = "krish"
    │
    ├── db/
    │   └── db.js                     # mongoose.connect(MONGODB_URI, { dbName: DB_NAME })
    │
    ├── model/                        # (singular "model", not "models")
    │   ├── usermodel.js              # User   — auth, avatar, watchHistory
    │   ├── videomodel.js             # Video  — + aggregate-paginate plugin
    │   ├── tweets.js                 # Tweet
    │   ├── comment.js                # Comment— + aggregate-paginate plugin
    │   ├── like.js                   # Like   — polymorphic (video|comment|tweet)
    │   ├── playlist.js               # Playlist
    │   └── subscription.js           # subscription — subscriber/channel pair
    │
    ├── controller/                   # (singular "controller")
    │   ├── user_controller.js        # ✅ FULLY WIRED to routes
    │   ├── vidio_controller.js       # ⚠️ written, NO routes
    │   ├── tweet.js                  # ⚠️ written, NO routes
    │   ├── comment.js                # ❌ broken imports + incomplete, NO routes
    │   └── playlist.js               # ❌ EMPTY FILE
    │
    ├── routes/
    │   └── user_routes.js            # the only router mounted in app.js
    │
    └── utils/
        ├── ApiError.js               # class ApiError extends Error
        ├── ApiResponse.js            # class ApiResponse
        ├── asyncHandler.js           # promise wrapper, forwards errors to next()
        └── cloudinary.js             # uploadCloudinary / deleteFromCloudinary
```

### Import-path quirks to remember

- `middlewares/` is **outside** `src/`, so routes import it as `../../middlewares/...`.
- The model folder is `model/` (singular) and the controller folder is `controller/` (singular). Any new file must follow this or imports break.

---

## 3. Tech Stack & Dependencies

### Runtime dependencies

| Package | Why it's here |
| --- | --- |
| `express` ^5.2.1 | HTTP server & routing |
| `mongoose` ^9.10.1 | MongoDB ODM / schemas |
| `mongoose-aggregate-paginate-v2` | Pagination plugin on `Video` + `Comment` |
| `jsonwebtoken` | Signing/verifying access & refresh tokens |
| `bcrypt` | Password hashing (10 salt rounds) |
| `cookie-parser` | Reads `req.cookies.accessToken` |
| `cors` | Cross-origin access for the frontend |
| `multer` ^2.4.0 | `multipart/form-data` file uploads |
| `cloudinary` ^2.11.0 | Cloud media storage (images + video) |
| `dotenv` | Loads `src/.env` |
| `path`, `hashlib` | Present in `package.json` but unused in code |

### Dev dependencies

`nodemon` (auto-restart), `prettier` (formatting).

---

## 4. Environment Variables

The app reads **`./src/.env`** (hard-coded path in `src/index.js`). Create it with these keys:

```env
PORT=8008

MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net

# IMPORTANT for the frontend — see §12. Do NOT leave this as *
CORS_ORIGIN=http://localhost:5173

ACCESS_TOKEN_SECRET=<long-random-string>
ACCESS_TOKEN_EXPIRY=1d

REFRESH_TOKEN_SECRET=<another-long-random-string>
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>
```

Notes:

- The database **name** is not from env — it is `DB_NAME = "krish"` in `src/constants.js`.
- `NODE_ENV` is **not** in the env file. Cookies use `secure: process.env.NODE_ENV === "production"`, so in dev `secure` is `false`, which is what you want for `http://localhost`.
- `.gitignore` already covers `.env` and `.env.*` at any depth.

---

## 5. How to Run

```bash
npm install          # install dependencies
npm run dev          # nodemon src/index.js  (development)
npm start            # node src/index.js     (production)
```

Expected startup output:

```text
MongoDB connected: <host>
Server is running on port 8008
```

If `MONGODB_URI` is missing, `connectDB()` throws and the process exits with code 1.

---

## 6. Request Lifecycle

```text
Browser / Frontend
      │
      ▼
src/index.js            dotenv → connectDB() → app.listen(PORT)
      │
      ▼
src/app.js              cors(credentials:true)
                        express.json({ limit: "20kb" })
                        express.urlencoded({ extended:true, limit:"20kb" })
                        express.static("public")
                        cookieParser()
      │
      ▼
app.use("/api/users", userRouter)
      │
      ├── upload (multer)      → files land in public/temp
      ├── verifyJwt            → reads cookie or Bearer header, sets req.user
      ▼
controller (wrapped in asyncHandler)
      │
      ├── success → res.json(new ApiResponse(status, data, message))
      └── throw   → next(err)
                      │
                      ▼
      global error handler in app.js
         • MulterError            → 400 with a friendly field message
         • ApiError / any error   → err.statusCode || 500
```

**Body-size limit:** JSON and urlencoded bodies are capped at **20 kb**. Send files as `multipart/form-data` (multer), never as base64 JSON.

---

## 7. Database Models (Schemas)

All models have `timestamps: true`, so every document also has `createdAt` and `updatedAt`.

### `User` — `src/model/usermodel.js`

| Field | Type | Rules |
| --- | --- | --- |
| `username` | String | required, **unique**, trimmed, indexed, stored lowercase |
| `email` | String | required, **unique**, trimmed, indexed, stored lowercase |
| `fullname` | String | required, trimmed, indexed |
| `avatar` | String | **required** — Cloudinary URL |
| `coverImage` | String | optional — Cloudinary URL |
| `watchHistory` | [ObjectId → `Video`] | array of watched videos |
| `password` | String | required, bcrypt-hashed in a `pre("save")` hook |
| `refreshToken` | String | current refresh token; `$unset` on logout |

Instance methods:

- `isPasswordCorrect(plainPassword)` → `Promise<boolean>` (bcrypt compare)
- `generateAccessToken()` → JWT with `{ _id, email, username }`, expiry `ACCESS_TOKEN_EXPIRY`
- `generateRefreshToken()` → JWT with `{ _id }`, expiry `REFRESH_TOKEN_EXPIRY`

> The `pre("save")` hook is an `async function` with **no `next` callback** — intentional. Mongoose treats async middleware as promise-based; calling `next()` there previously threw `next is not a function` on every `create()`/`save()`.

### `Video` — `src/model/videomodel.js`

| Field | Type | Rules |
| --- | --- | --- |
| `videoFile` | String | required — Cloudinary URL |
| `thumbnail` | String | default `""` |
| `title` | String | required |
| `description` | String | required |
| `duration` | Number | required (seconds, from Cloudinary) |
| `views` | Number | default `0` |
| `isPublished` | Boolean | default `true` |
| `owner` | ObjectId → `User` | |

Plugin: `mongooseAggregatePaginate`.

### `Tweet` — `src/model/tweets.js`

| Field | Type | Rules |
| --- | --- | --- |
| `owner` | ObjectId → `User` | |
| `content` | String | required, trimmed |

### `Comment` — `src/model/comment.js`

| Field | Type | Rules |
| --- | --- | --- |
| `owner` | ObjectId → `User` | **required** |
| `tweet` | ObjectId → `Tweet` | **required** ← see §12 |
| `content` | String | required, trimmed |
| `video` | ObjectId → `Video` | optional |
| `mediaType` | String | enum `image` \| `video` \| `gif`, default `image` |
| `mediaUrl` | String | default `""` |

Plugin: `mongooseAggregatePaginate`.

### `Like` — `src/model/like.js`

Polymorphic like: `video?`, `comment?`, `tweet?` (any one set) plus `likedBy` (required, → `User`). **No controller or route uses this yet.**

### `Playlist` — `src/model/playlist.js`

| Field | Type | Rules |
| --- | --- | --- |
| `owner` | ObjectId → `User` | required |
| `video` | [ObjectId → `Video`] | array (field is singular `video`) |
| `name` | String | required, trimmed |
| `description` | String | required, trimmed |

**No controller or route yet** (`src/controller/playlist.js` is empty).

### `subscription` — `src/model/subscription.js`

| Field | Type | Meaning |
| --- | --- | --- |
| `subscriber` | ObjectId → `User` | the one who subscribes |
| `channel` | ObjectId → `User` | the one being subscribed to |

Registered as `mongoose.model("subscription", ...)` → actual MongoDB collection name is **`subscriptions`**. This matters for `$lookup` (see §12).

---

## 8. Response Format

Every endpoint returns the same JSON envelope — build **one** API wrapper in the frontend around this.

### Success (`ApiResponse`)

```json
{
  "statusCode": 200,
  "data": {},
  "message": "User fetched successfully",
  "success": true
}
```

`success` is computed as `statusCode < 400`.

### Error (global handler in `app.js`)

```json
{
  "success": false,
  "message": "User does not exist",
  "errors": [],
  "statusCode": 404
}
```

### Multer error (wrong file field)

```json
{
  "success": false,
  "message": "Unexpected file field \"photo\". Expected \"avatar\" or \"coverImage\".",
  "errors": [],
  "statusCode": 400
}
```

> Note the key-order difference: success responses put `statusCode` first, errors put `success` first. Both always contain `statusCode`, `message` and `success`, so read those fields rather than relying on shape.

---

## 9. Authentication Flow

```text
POST /api/users/register   (multipart, avatar required)
        └─> 201, user object (password & refreshToken stripped)

POST /api/users/login      { username | email, password }
        └─> 200
            • Set-Cookie: accessToken  (httpOnly)
            • Set-Cookie: refreshToken (httpOnly)
            • body.data = { user, accesstoken, refreshToken }

Protected request
        • Browser: cookies are sent automatically → use credentials/withCredentials
        • Non-browser (Postman/mobile): Authorization: Bearer <accessToken>

Access token expires (401)
        └─> POST /api/users/refresh-token   (cookie or { refreshToken } in body)
              └─> 200, new cookie pair + new tokens in body

POST /api/users/logout     (protected)
        └─> $unset refreshToken in DB + clears both cookies
```

`verifyJwt` (`middlewares/authmiddleware.js`):

1. Token from `req.cookies.accessToken`, else `Authorization: Bearer <token>` (case-insensitive prefix).
2. `jwt.verify(token, ACCESS_TOKEN_SECRET)`.
3. Loads the user by `_id`, minus `password` and `refreshToken`.
4. Sets `req.user` and calls `next()`.
5. Any failure → `401`.

⚠️ Note the response body field is spelled **`accesstoken`** (all lowercase) while the cookie is **`accessToken`** (camelCase). Don't mix them up in the frontend.

---

## 10. API Reference — Live Endpoints

Base: `http://localhost:8008/api/users`
🔒 = requires `verifyJwt`

| # | Method | Path | Auth | Body type |
| --- | --- | --- | --- | --- |
| 1 | POST | `/register` | — | `multipart/form-data` |
| 2 | POST | `/login` | — | JSON |
| 3 | POST | `/logout` | 🔒 | — |
| 4 | POST | `/refresh-token` | — | JSON / cookie |
| 5 | POST | `/change-password` | 🔒 | JSON |
| 6 | GET | `/current-user` | 🔒 | — |
| 7 | PATCH | `/update-account` | 🔒 | JSON |
| 8 | PATCH | `/avatar` | 🔒 | `multipart/form-data` |
| 9 | PATCH | `/cover-image` | 🔒 | `multipart/form-data` |
| 10 | POST | `/create-tweets` | 🔒 | JSON |
| 11 | GET | `/tweets` | 🔒 | — |
| 12 | GET | `/c/:username` | 🔒 | — |
| 13 | GET | `/watch-history` | 🔒 | — |
| 14 | POST | `/comment-message` | 🔒 | JSON |
| 15 | GET | `/comment-message?tweetId=` | 🔒 | query |
| 16 | DELETE | `/comment-message/:commentId` | 🔒 | — |

---

### 1. Register — `POST /register`

Content-Type: `multipart/form-data`

| Field | Required | Notes |
| --- | --- | --- |
| `fullname` | ✅ | |
| `username` | ✅ | lowercased before saving |
| `email` | ✅ | lowercased before saving |
| `password` | ✅ | hashed with bcrypt |
| `avatar` | ✅ | file; multer `maxCount: 4` but only `[0]` is used |
| `coverImage` | ❌ | file; `maxCount: 1` |

Keys and string values are trimmed before validation, so stray whitespace in field names is tolerated.

**201**

```json
{
  "statusCode": 201,
  "data": {
    "_id": "6700...",
    "username": "siddhant",
    "email": "sid@mail.com",
    "fullname": "Siddhant Bhatnagar",
    "avatar": "https://res.cloudinary.com/.../avatar.jpg",
    "coverImage": "",
    "watchHistory": [],
    "createdAt": "2026-10-09T...",
    "updatedAt": "2026-10-09T...",
    "__v": 0
  },
  "message": "User registered successfully",
  "success": true
}
```

Errors: `400` missing field · `400` avatar missing · `400` avatar/cover upload failed · `500` user creation failed.

<details>
<summary>Frontend example</summary>

```js
const fd = new FormData();
fd.append("fullname", fullname);
fd.append("username", username);
fd.append("email", email);
fd.append("password", password);
fd.append("avatar", avatarFile);          // field name MUST be "avatar"
if (coverFile) fd.append("coverImage", coverFile);

await fetch("http://localhost:8008/api/users/register", {
  method: "POST",
  body: fd,                                // do NOT set Content-Type yourself
  credentials: "include",
});
```

</details>

---

### 2. Login — `POST /login`

```json
{ "username": "siddhant", "password": "secret123" }
```

or

```json
{ "email": "sid@mail.com", "password": "secret123" }
```

At least one of `username`/`email` plus `password` is required.

**200** — sets both cookies and returns:

```json
{
  "statusCode": 200,
  "data": {
    "user": { "_id": "...", "username": "siddhant", "...": "..." },
    "accesstoken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  },
  "message": "User logged in successfully",
  "success": true
}
```

Errors: `400` missing credentials · `404` user does not exist · `401` password is incorrect.

---

### 3. Logout — `POST /logout` 🔒

No body. Clears cookies and `$unset`s `refreshToken`.

**200** → `{ "statusCode": 200, "data": {}, "message": "User logged out", "success": true }`

---

### 4. Refresh token — `POST /refresh-token`

Reads `req.cookies.refreshToken`, else `{ "refreshToken": "..." }` in the body.

**200** → `data = { accesstoken, refreshToken }` + fresh cookies.

Errors: `401` no token · `401` invalid token · `401` refresh token is expired (DB mismatch).

> Frontend pattern: on any `401` from a protected call, hit this once, then retry the original request; if refresh also 401s, clear local state and redirect to login.

---

### 5. Change password — `POST /change-password` 🔒

```json
{ "oldPassword": "old123", "newPassword": "new456" }
```

**200** → `data = {}`, message `"Password changed successfully"`.
Errors: `400` missing field · `401` password is incorrect.

---

### 6. Current user — `GET /current-user` 🔒

Returns `req.user` (already stripped of `password` and `refreshToken`). Use this on app boot to restore the session from the cookie.

---

### 7. Update account — `PATCH /update-account` 🔒

```json
{ "fullname": "New Name", "email": "new@mail.com" }
```

**Both fields are required** — this is a full replace of those two fields, not a partial patch.
**200** → updated user. Errors: `400` missing field · `404` user not found.

---

### 8. Update avatar — `PATCH /avatar` 🔒

`multipart/form-data`, single file field **`avatar`**. The old Cloudinary image is deleted first, then the new one is uploaded.

**200** → updated user object. Errors: `400` file missing · `404` user not found · `400` upload error.

---

### 9. Update cover image — `PATCH /cover-image` 🔒

`multipart/form-data`, single file field **`coverImage`**. Old cover is deleted from Cloudinary first.

**200** → updated user object.

> Quirk: the controller accepts `req.files.avatar[0]` as a fallback source, so a file sent under `avatar` here would be saved as the cover image. Always send `coverImage`.

---

### 10. Create tweet — `POST /create-tweets` 🔒

```json
{ "content": "my first tweet" }
```

**201** → `data = { _id, content, owner, createdAt, updatedAt, __v }`.
Error: `400` content required.

---

### 11. My tweets — `GET /tweets` 🔒

Returns **only the logged-in user's** tweets, newest first, with `owner` populated as `{ _id, username, fullname, avatar }`.

```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "...",
      "content": "my first tweet",
      "owner": {
        "_id": "...",
        "username": "siddhant",
        "fullname": "Siddhant",
        "avatar": "https://..."
      },
      "createdAt": "2026-10-09T..."
    }
  ],
  "message": "Tweets fetched successfully",
  "success": true
}
```

> There is **no global/public tweet feed endpoint** yet. See §17.

---

### 12. Channel profile — `GET /c/:username` 🔒

Aggregation that joins subscriptions and returns `subscribersCount`, `channelsSubscribeToCount`, `isSubscribed`.

**Intended 200 shape:**

```json
{
  "statusCode": 200,
  "data": {
    "username": "siddhant",
    "fullname": "Siddhant Bhatnagar",
    "email": "sid@mail.com",
    "avatar": "https://...",
    "coverImage": "https://...",
    "subscribersCount": 12,
    "channelsSubscribeToCount": 5,
    "isSubscribed": false
  },
  "message": "Channel profile fetched successfully",
  "success": true
}
```

❌ **This endpoint currently fails** — two bugs, both detailed in §12 (mixed `$project`, and `$lookup from: "subscription"` instead of `"subscriptions"`). Don't build the channel page against it until they're fixed.

---

### 13. Watch history — `GET /watch-history` 🔒

Aggregation: `User` → `$lookup` videos in `watchHistory` → nested `$lookup` of each video's owner (`fullname`, `username`, `avatar`) → `$unwind` owner.

**200**

```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "videoId",
      "videoFile": "https://...",
      "thumbnail": "https://...",
      "title": "Video title",
      "description": "...",
      "duration": 215,
      "views": 0,
      "isPublished": true,
      "owner": {
        "_id": "...",
        "fullname": "Siddhant",
        "username": "siddhant",
        "avatar": "https://..."
      }
    }
  ],
  "message": "Watch history fetched successfully",
  "success": true
}
```

Returns `[]` when empty. ⚠️ Nothing in the codebase **writes** to `watchHistory` yet, so this will stay empty until a "mark as watched" endpoint exists.

---

### 14. Create comment — `POST /comment-message` 🔒

```json
{ "content": "nice tweet!", "tweetId": "6700abc..." }
```

**201** → comment with `owner` populated `{ _id, username, fullname, avatar }`.
Errors: `400` content required · `400` tweet id required.

> Comments are attached to **tweets only** through this route. Video comments are not reachable yet (see §11).

---

### 15. Get comments — `GET /comment-message?tweetId=<id>` 🔒

Query param `tweetId` is required. Returns an array, newest first, `owner` populated.
Error: `400` tweet id required.

---

### 16. Delete comment — `DELETE /comment-message/:commentId` 🔒

Ownership is enforced — only the comment's author can delete it.

**200** → `data = {}`, message `"Comment deleted successfully"`.
Errors: `400` id required · `404` comment not found · `403` "You can only delete comments created by you".

---

## 11. Controllers That Exist But Have NO Routes

These functions are written but **not reachable over HTTP** — nothing imports them into a router, and `app.js` only mounts `userRouter`. **A frontend cannot call them today.**

### `src/controller/vidio_controller.js` — ready, just needs a router

| Function | Intended route |
| --- | --- |
| `getAllVideos` | `GET /api/videos` — supports `page`, `limit`, `query` (title regex, case-insensitive), `sortBy`, `sortType=asc\|desc`, `userId` |
| `publishAVideo` | `POST /api/videos` — multipart `videoFile`, + `title`, `description`; uploads to Cloudinary as `resource_type: "video"` |
| `createVideo` | `POST /api/videos/create` — JSON only (URLs supplied by the client) |
| `uploadvidio` | `POST /api/videos/upload` — uploads a file and returns the raw Cloudinary response |
| `getVideoById` | `GET /api/videos/:videoId` — validates ObjectId, `404` if missing |
| `updateVideo` | `PATCH /api/videos/:videoId` — partial: `title`, `description`, `thumbnail` |
| `deleteVideo` | `DELETE /api/videos/:videoId` — also deletes the Cloudinary asset |
| `togglePublishStatus` | `PATCH /api/videos/toggle/publish/:videoId` — flips `isPublished` |

⚠️ `updateVideo`, `deleteVideo` and `togglePublishStatus` do **not** check that `req.user` owns the video. Add an ownership check before exposing them.

### `src/controller/tweet.js` — ready, just needs a router

`createTweet`, `getUserTweets` (`:userId` param → any user's tweets, unlike the `/api/users/tweets` route which is self-only), `updateTweet` (owner-scoped `findOneAndUpdate`), `deleteTweet` (owner-scoped). These duplicate/supersede the tweet functions currently living in `user_controller.js`.

### `src/controller/comment.js` — ❌ broken, do not wire yet

- Imports `Comment` **twice** — from `../models/comment.model.js` (a path that does not exist) and from `../model/comment.js`. A duplicate binding in the same scope is a **SyntaxError**; the file would crash the server the moment anything imports it. (The app runs today only because nothing does.)
- `getVideoComments` destructures `videoId`/`page`/`limit` and then returns nothing — no response is ever sent.
- `addComment` creates the comment but never calls `res.json(...)` — the request hangs.
- `updateComment` and `deleteComment` are empty stubs.
- `addComment` also omits `tweet`, which the `Comment` schema marks `required` → it would throw a validation error anyway.

### `src/controller/playlist.js` — ❌ empty file

The `Playlist` model exists; no logic written. Needs create / get-by-id / get-user-playlists / add-video / remove-video / update / delete.

### `src/model/like.js` — no controller at all

Model is ready for toggling likes on videos, comments and tweets. No endpoints.

---

## 12. Known Bugs / Gotchas Before You Build Frontend

**1. `CORS_ORIGIN=*` + `credentials: true` breaks cookie auth in the browser.**
A browser rejects any credentialed response whose `Access-Control-Allow-Origin` is `*`. Set an explicit origin in `src/.env`:

```env
CORS_ORIGIN=http://localhost:5173
```

Without this, every `credentials: "include"` / `withCredentials: true` request fails in the browser (while still working fine in Postman).

**2. `GET /c/:username` — mixed `$project` stage.**

```js
$project: { password: 0, username: 1, fullname: 1, ... }
```

MongoDB does not allow mixing exclusion (`0`) and inclusion (`1`) in one `$project` (only `_id` may be excluded in an inclusion projection). Fix: drop `password: 0` and keep the inclusion list.

**3. `GET /c/:username` — wrong `$lookup` collection name.**
Both `$lookup` stages use `from: "subscription"`, but `mongoose.model("subscription", ...)` creates the collection **`subscriptions`**. As written, `subscribers`/`subscribersTo` always come back empty → counts are `0` and `isSubscribed` is always `false`. Fix: `from: "subscriptions"`.

**4. `isSubscribed` compares types that never match.**
`$in: [req.user?._id, "$subscribers.subscriber"]` compares a Mongoose ObjectId wrapper against stored ObjectIds inside an aggregation. Wrap it: `new mongoose.Types.ObjectId(req.user._id)`.

**5. `Comment.tweet` is `required`, which blocks video comments.**
To comment on videos, make `tweet` optional and validate "exactly one of `tweet` / `video`" in the controller.

**6. Response field naming inconsistency.** `accesstoken` (body) vs `accessToken` (cookie). Pick one before the frontend hard-codes the wrong key.

**7. `public/temp` holds leftover uploads.** `uploadCloudinary` deletes the local file on both success and failure, but files from crashed runs remain. Safe to clear; keep `.gitkeep`.

**8. No rate limiting, no input-format validation** (email shape, password strength, content length). Validate in the frontend *and* add server-side validation (e.g. `zod` / `express-validator`) before any real deployment.

**9. No subscribe/unsubscribe endpoint.** The `subscription` model exists but nothing writes to it, so subscriber counts will be `0` even after fixing bugs 2–4.

**10. `getAllVideos` ignores `isPublished`.** Once routed, it would return unpublished videos to everyone. Add `filter.isPublished = true` for public listings.

---

## 13. Building the Frontend

### Recommended setup

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install axios react-router-dom
npm run dev          # http://localhost:5173
```

Then set `CORS_ORIGIN=http://localhost:5173` in `src/.env` and restart the backend (see §12 bug 1).

### `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:8008/api
```

### One axios instance for the whole app

```js
// src/lib/api.js
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // http://localhost:8008/api
  withCredentials: true,                      // sends httpOnly cookies
});

// Auto-refresh once on 401, then retry the original request
let refreshing = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retried) {
      original._retried = true;
      try {
        refreshing = refreshing || api.post("/users/refresh-token");
        await refreshing;
        refreshing = null;
        return api(original);
      } catch (e) {
        refreshing = null;
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
```

### Reading the envelope consistently

```js
// success: { statusCode, data, message, success }
// error:   { success:false, message, errors, statusCode }
export const unwrap = (res) => res.data.data;
export const errMsg = (e) => e.response?.data?.message ?? "Something went wrong";
```

### Auth service

```js
// src/services/auth.js
import { api, unwrap } from "../lib/api";

export const register = (formData) =>
  api.post("/users/register", formData).then(unwrap); // FormData

export const login = ({ username, email, password }) =>
  api.post("/users/login", { username, email, password }).then(unwrap);

export const logout = () => api.post("/users/logout").then(unwrap);
export const getCurrentUser = () => api.get("/users/current-user").then(unwrap);

export const changePassword = (oldPassword, newPassword) =>
  api.post("/users/change-password", { oldPassword, newPassword }).then(unwrap);

export const updateAccount = (fullname, email) =>
  api.patch("/users/update-account", { fullname, email }).then(unwrap);

export const updateAvatar = (file) => {
  const fd = new FormData();
  fd.append("avatar", file);
  return api.patch("/users/avatar", fd).then(unwrap);
};

export const updateCover = (file) => {
  const fd = new FormData();
  fd.append("coverImage", file);
  return api.patch("/users/cover-image", fd).then(unwrap);
};
```

### Tweets + comments service

```js
// src/services/social.js
import { api, unwrap } from "../lib/api";

export const createTweet = (content) =>
  api.post("/users/create-tweets", { content }).then(unwrap);
export const getMyTweets = () => api.get("/users/tweets").then(unwrap);

export const addComment = (tweetId, content) =>
  api.post("/users/comment-message", { tweetId, content }).then(unwrap);
export const getComments = (tweetId) =>
  api.get("/users/comment-message", { params: { tweetId } }).then(unwrap);
export const deleteComment = (commentId) =>
  api.delete(`/users/comment-message/${commentId}`).then(unwrap);

export const getWatchHistory = () => api.get("/users/watch-history").then(unwrap);
export const getChannel = (username) =>
  api.get(`/users/c/${username}`).then(unwrap);
```

### Session restore on app boot

Because tokens live in **httpOnly cookies**, JavaScript can't read them. Don't try to persist the user in `localStorage` as the source of truth — call `/users/current-user` on mount:

```jsx
useEffect(() => {
  getCurrentUser()
    .then(setUser)
    .catch(() => setUser(null))
    .finally(() => setLoading(false));
}, []);
```

### File-upload rules

- Always `FormData`; **never** set `Content-Type` manually — the browser must add the multipart boundary.
- Field names are exact: `avatar`, `coverImage`, `videoFile`.
- JSON bodies are capped at 20 kb, so no base64 payloads.
- Show a preview with `URL.createObjectURL(file)` and validate size/type client-side (the backend has no file-size limit configured).

---

## 14. Suggested Frontend Pages & Which API They Use

| Page / Route | Endpoints | Status |
| --- | --- | --- |
| `/register` | `POST /users/register` | ✅ ready |
| `/login` | `POST /users/login` | ✅ ready |
| App shell / auth guard | `GET /users/current-user`, `POST /users/refresh-token`, `POST /users/logout` | ✅ ready |
| `/settings/profile` | `PATCH /users/update-account`, `PATCH /users/avatar`, `PATCH /users/cover-image` | ✅ ready |
| `/settings/password` | `POST /users/change-password` | ✅ ready |
| `/tweets` (my tweets + composer) | `POST /users/create-tweets`, `GET /users/tweets` | ✅ ready |
| Tweet comment thread | `POST`/`GET`/`DELETE /users/comment-message` | ✅ ready |
| `/history` | `GET /users/watch-history` | ⚠️ works but always empty (nothing writes `watchHistory`) |
| `/c/:username` (channel) | `GET /users/c/:username` | ❌ broken — fix §12 bugs 2–4 first |
| `/` (video feed) | `getAllVideos` | ❌ no route yet |
| `/watch/:videoId` | `getVideoById`, video comments | ❌ no route yet |
| `/upload` | `publishAVideo` | ❌ no route yet |
| `/dashboard` (my videos) | `updateVideo`, `deleteVideo`, `togglePublishStatus` | ❌ no route yet |
| `/playlists` | — | ❌ controller empty |
| Like buttons | — | ❌ model only |
| Subscribe button | — | ❌ nothing writes `subscription` |

**Build order suggestion:** auth → profile/settings → tweets + comments (everything above is live today) → then add the missing routers for video/tweet/comment/playlist/like/subscription and build those pages.

---

## 15. HTTP Status Codes Used

| Code | Meaning | Where it appears here |
| --- | --- | --- |
| 200 | OK | fetches, updates, logout, delete |
| 201 | Created | register, create tweet, create comment, publish video |
| 400 | Bad Request | missing/invalid fields, upload failure, invalid ObjectId, Multer errors |
| 401 | Unauthorized | missing/invalid/expired token, wrong password |
| 403 | Forbidden | deleting someone else's comment |
| 404 | Not Found | user / video / comment / channel does not exist |
| 500 | Internal Server Error | token generation failure, unexpected errors |

Reference list of other common codes lives in `ERROR.MD` (409 conflict, 422 validation, 429 rate limit, 502/503/504 gateway).

---

## 16. Aggregation Notes

From `aggrigation.md`, the operators actually used in this codebase:

| Stage | Purpose | Used in |
| --- | --- | --- |
| `$match` | filter documents | channel profile, watch history |
| `$lookup` | join another collection | channel profile (subscriptions), watch history (videos → users) |
| `$addFields` | compute new fields | `subscribersCount`, `isSubscribed` |
| `$size` | array length | subscriber counts |
| `$cond` | if/then/else | `isSubscribed` |
| `$project` | choose returned fields | both aggregations |
| `$unwind` | array → separate docs | watch-history owner |

Also worth remembering:

- `req.params` → URL segment (`/users/:id`)
- `req.query` → query string (`/videos?page=2&limit=10`)
- `req.body` → JSON / form body

---

## 17. Roadmap / TODO

**Unblock the frontend (do these first)**

- [ ] Set `CORS_ORIGIN` to the real frontend origin (not `*`)
- [ ] Fix the two `$project` / `$lookup` bugs in `getUserChannelProfile`
- [ ] Standardise on `accessToken` in response bodies

**Make existing controllers reachable**

- [ ] `src/routes/video_routes.js` → mount at `/api/videos` in `app.js`
- [ ] `src/routes/tweet_routes.js` → mount at `/api/tweets` (public feed + per-user)
- [ ] Fix `src/controller/comment.js` (duplicate import, missing responses, `tweet` required) → `src/routes/comment_routes.js`
- [ ] Add ownership checks to `updateVideo` / `deleteVideo` / `togglePublishStatus`

**New features**

- [ ] `src/controller/playlist.js` + routes (create, add/remove video, list, delete)
- [ ] Like controller + routes (toggle like on video / comment / tweet, count likes)
- [ ] Subscribe / unsubscribe + "my subscriptions" feed
- [ ] `POST /videos/:videoId/view` → increment `views` and push to `watchHistory`
- [ ] Pagination via `aggregatePaginate` on videos and comments (plugin already installed)

**Hardening**

- [ ] Server-side validation (`zod` / `express-validator`)
- [ ] Rate limiting on login / register
- [ ] Multer `limits: { fileSize }` + MIME whitelist
- [ ] `404` catch-all route
- [ ] `.env.sample` committed for onboarding

---

**Author:** siddhantbhatnagar · ESM Node.js + Express 5 + MongoDB · see `readme.md` for the original boilerplate notes.
