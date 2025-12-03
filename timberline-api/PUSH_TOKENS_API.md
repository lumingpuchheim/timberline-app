## Push Tokens API – Local Server & curl Usage

### 1. Prerequisites

- Node.js 18+ installed
- Dependencies installed:

```bash
cd timberline-api
npm install
```

---

### 2. Configure admin key (local)

1. In `timberline-api`, create a file named `.env.local`:

   - Full path: `C:\Users\user\workspace\timberline\timberline-api\.env.local`

2. Add this content (choose any secret string you like):

```env
ADMIN_API_KEY=your-very-secret-admin-key
```

This key is required for all **admin** endpoints (list, count, delete).

---

### 3. Start the local server

From the `timberline-api` directory:

```bash
cd C:\Users\user\workspace\timberline\timberline-api; npm run dev
```

You should see:

```text
Timberline API listening on http://localhost:4000
```

The relevant endpoints are now available under `http://localhost:4000`.

---

### 4. API endpoints

All examples below assume **bash** on Windows.

#### 4.1 Add a token (public)

- **Method**: `POST`
- **URL**: `http://localhost:4000/api/add-token`
- **Auth**: none (public)
- **Body**: JSON `{ token, platform }`

```bash
curl -X POST "http://localhost:4000/api/add-token" -H "Content-Type: application/json" -d '{"token":"ExponentPushToken[TEST-1234567890]","platform":"android"}'
```

Expected response: `204 No Content` (empty body).

---

#### 4.2 List all tokens (admin only)

- **Method**: `GET`
- **URL**: `http://localhost:4000/api/tokens`
- **Auth**: header `X-Admin-Api-Key: <your ADMIN_API_KEY>`

```bash
curl -X GET "http://localhost:4000/api/tokens" -H "X-Admin-Api-Key: your-very-secret-admin-key"
```

Example response:

```json
{
  "tokens": [
    {
      "token": "ExponentPushToken[TEST-1234567890]",
      "platform": "android",
      "registeredAt": "2025-12-03T07:33:28.299Z"
    }
  ]
}
```

---

#### 4.3 Get token count (admin only)

- **Method**: `GET`
- **URL**: `http://localhost:4000/api/tokens/count`

```bash
curl -X GET "http://localhost:4000/api/tokens/count" -H "X-Admin-Api-Key: your-very-secret-admin-key"
```

Example response:

```json
{ "count": 1 }
```

---

#### 4.4 Delete a single token (admin only)

- **Method**: `DELETE`
- **URL**: `http://localhost:4000/api/token/:id`
  - `:id` is the **exact token string**.

```bash
curl -X DELETE "http://localhost:4000/api/token/ExponentPushToken[TEST-1234567890]" -H "X-Admin-Api-Key: your-very-secret-admin-key"
```

Expected response: `204 No Content`.

---

#### 4.5 Delete all tokens (admin only)

- **Method**: `DELETE`
- **URL**: `http://localhost:4000/api/tokens/all`

```bash
curl -X DELETE "http://localhost:4000/api/tokens/all" -H "X-Admin-Api-Key: your-very-secret-admin-key"
```

Expected response: `204 No Content`.

---

### 5. Quick manual test flow

1. **Start server**:

   ```bash
   cd C:\Users\user\workspace\timberline\timberline-api; npm run dev
   ```

2. **Add two tokens** (call the `POST /api/add-token` command twice with different tokens).

3. **Check count**:

   ```bash
   curl -X GET "http://localhost:4000/api/tokens/count" -H "X-Admin-Api-Key: your-very-secret-admin-key"
   ```

4. **Inspect exact tokens**:

   ```bash
   curl -X GET "http://localhost:4000/api/tokens" -H "X-Admin-Api-Key: your-very-secret-admin-key"
   ```

5. **Clean up everything**:

   ```bash
   curl -X DELETE "http://localhost:4000/api/tokens/all" -H "X-Admin-Api-Key: your-very-secret-admin-key"
   ```


