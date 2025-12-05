## Timberline – Implementation Overview

### 1. Data Source and Update Flow

- **Primary data source**:  
  - Public 13F holdings for Himalaya Capital Management LLC, accessed via `13f.info` (which in turn is built on SEC EDGAR 13F filings).
- **Update script** (`timberline-api/scripts/update-himalaya.ts`):
  - Fetches the Himalaya manager page on `13f.info` and discovers all 13F filing links.
  - Parses each filing URL for year and quarter (e.g., `...-q3-2025`) and sorts them by **year DESC, quarter DESC**.
  - For the **latest quarter** and the **previous quarter**:
    - Loads the filing’s JSON data endpoint from `13f.info`.
    - Extracts per-position:
      - `symbol` (ticker or equivalent)
      - `issuer` (company name)
      - `percentage` (weight within the disclosed 13F slice)
      - `valueThousands` (Value in $000 as reported).
    - Computes `totalValueThousands` as the sum of all position values.
  - Writes two JSON snapshots under `timberline-api/data`:
    - `himalaya-latest.json` – latest quarter snapshot.
    - `himalaya-last-quarter.json` – last quarter snapshot.
- **Automation**:
  - A GitHub Action (`.github/workflows/update-himalaya.yml`) runs the update script on a schedule (weekly) and commits any changes to these JSON files back to the repository.

### 2. Backend API (file-backed server)

- **Local dev server** (`timberline-api/api/server.ts`):
  - Simple Express app exposing:
    - `GET /himalaya-latest` – reads and returns `himalaya-latest.json`.
    - `GET /himalaya-last-quarter` – reads and returns `himalaya-last-quarter.json`.
  - Used for local testing at `http://localhost:4000/...`.

- **Production API on Vercel**:
  - `timberline-api/api/himalaya-latest.ts`:
    - Reads `data/himalaya-latest.json` from disk and returns a snapshot:
      - `{ positions, totalValueThousands }`.
  - `timberline-api/api/himalaya-last-quarter.ts`:
    - Reads `data/himalaya-last-quarter.json` and returns:
      - `{ positions, totalValueThousands }`.
  - These files are deployed as **serverless functions** and exposed as:
    - `https://<api-project>.vercel.app/api/himalaya-latest`
    - `https://<api-project>.vercel.app/api/himalaya-last-quarter`

- **Reason for our own server (CORS workaround)**:
  - Browsers block direct cross-origin requests to `13f.info` because that domain does **not** send permissive CORS headers.
  - To avoid CORS issues in the frontend:
    - All calls to `13f.info` are performed **server-side** in our update script and API.
    - The mobile/web app talks only to our own API (`timberline-api` on Vercel or the local Express server), which responds with CORS-allowed JSON.
  - This design isolates scraping/aggregation on the backend and gives the frontend a simple, stable JSON interface.

### 3. Frontend – React Native App

- **Tech stack**:
  - React Native + Expo + `expo-router`, targeting:
    - iOS and Android apps.
    - Web build during development and for a simple web front.
- **Data hook** (`timberline/hooks/use-himalaya-positions.ts`):
  - Calls both API endpoints:
    - `GET /api/himalaya-latest`
    - `GET /api/himalaya-last-quarter`
  - Combines results into a state object with:
    - `positions` and `totalValueThousands` for the latest quarter.
    - `previousPositions` and `previousTotalValueThousands` for the last quarter.
  - The hook is used by the home screen to:
    - Show the **current reference portfolio** (top ~6 positions, with symbol, issuer, weight %, and value).
    - Compute and display **changes vs. last quarter**:
      - Added positions (present now, absent last quarter).
      - Exited positions (present last quarter, absent now).
      - Percentage and value changes for positions that exist in both quarters.

- **UI** (`timberline/app/(tabs)/index.tsx`):
  - Single main screen with:
    - Problem and value explanation (why Timberline exists and how users should use it).
    - “Latest Himalaya 13F positions” section:
      - Total disclosed value.
      - Compact cards for each top holding, with:
        - Symbol and current weight on one line.
        - Issuer name and value on the next line.
        - Clear labels for changes vs. last quarter where applicable.
    - “Exited positions since last quarter” section listing any fully sold holdings.

### 4. GitHub Actions Integration

- **Workflow file**: `.github/workflows/update-himalaya.yml`
  - Triggers:
    - `schedule` (e.g., weekly at a fixed UTC time).
    - `workflow_dispatch` (manual run from the GitHub UI).
  - Steps:
    1. Check out the repository.
    2. Set up Node.
    3. Run `npm install` in `timberline-api`.
    4. Run `npm run update:himalaya` to refresh `himalaya-latest.json` and `himalaya-last-quarter.json`.
    5. If those files changed, commit and push the updates.
  - This keeps the backend data snapshots in sync with the latest available 13F filings without requiring any manual work from the user.


