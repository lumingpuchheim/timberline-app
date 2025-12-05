## Timberline – Internal Product Description

### 1. Concept Overview

Timberline is a **minimalistic stock recommendation app** for mobile (iOS and Android).  
It provides a **single global reference portfolio** of **U.S. stocks**, updated **quarterly**, with **very few changes per year**.  
There is **no financial jargon** and **no charts** – users see only a clear, simple recommendation.

The portfolio is **directly based on the 13F filings of Himalaya Capital Management LLC** (Li Lu), and reflects the **same holdings** as disclosed there, following long-term **value investing principles** (in the spirit of Graham, Buffett, and Li Lu): concentrated, patient, and focused on underlying business value.

### 2. Target Users

- **Region**: Individuals in the **US and EU**.  
- **Profile**: Retail investors who:
  - Want a **simple, long-term reference** instead of active trading ideas.
  - Prefer **low activity** and **few decisions**.
  - Are comfortable following a **concentrated, long-term value portfolio**.

### 3. Product Scope

- **Platform**:  
  - **React Native** as the primary technology stack.  
  - Production targets: **iOS** and **Android** only.  
  - During development, a **Web build** (e.g., using `react-native-web`) may be used for faster iteration and internal testing, but the **final product is mobile-only**.
- **Pricing (initial idea)**:  
  - One-time purchase in the range of **EUR/USD 6.99**, with **no subscription**.  
  - Price should feel low enough to be an easy decision while still signaling seriousness and covering operating costs.
- **Functionality**:
  - **Read-only recommendations**.  
  - No trading, no broker integrations, no portfolio tracking.
  - Users **cannot input their own holdings**.
  - Everyone sees the **same reference portfolio** and its **history**.
  - The app should send a **quarterly notification** when a new reference portfolio is available, so users can wait and relax between updates instead of checking manually.

### 4. Portfolio Definition

- **Asset universe**:  
  - **U.S. stocks only** (no ETFs, no funds, no bonds, no other asset classes).
  - Holdings are intended to **match the positions disclosed in Himalaya Capital Management LLC’s 13F** for the corresponding quarter.
- **Structure**:
  - A **single global reference portfolio** shared by all users.
  - Typically **5 individual stocks** at any given time.
  - **Very low turnover**: only a few changes per year.
- **Update frequency**:
  - Portfolio is reviewed and potentially updated **once per quarter**.
  - Each update defines a new **“quarterly reference portfolio”**.

### 5. Quarterly Experience

For each quarter, Timberline should provide:

- **Current reference portfolio view**:
  - List of the **~5 recommended U.S. stocks**.
  - Basic position data in a minimal form (e.g., name and ticker; weights if desired in later design).
  - No charts, no complex metrics.

- **Change summary vs. last quarter**:
  - Clear indication of **what changed** since the previous quarterly portfolio:
    - Added stocks.
    - Removed stocks.
    - Any major change in emphasis (if needed in future versions).
   - A concise explanation of **position-level changes** in plain language, for example:
     - “Increased Apple by ~30%.”
     - “Exited Amazon completely.”
   - The app should highlight these changes clearly so users can see at a glance what was bought more of, what was reduced, and what was sold.
  - Wording stays **simple and non-technical**.

- **Optional plain-language notes (future decision)**:
  - The design should allow for **very brief, everyday-language explanations** per change or per quarter (e.g., 1–2 short sentences), but they **may be left empty** if we choose not to use them.

### 6. History & Navigation

- The app keeps an **in-app history of past quarters**:
  - Users can browse **previous quarterly reference portfolios**.
  - For each past quarter, users can see:
    - The portfolio composition at that time.
    - The changes relative to the previous quarter.
- History is **read-only** and intended as a **record of the long-term strategy**.

### 7. UX & Content Style

- **Overall feel**:
  - **Minimalistic**, clean, and calm.
  - Emphasis on **clarity and simplicity**.
  - No noisy elements, no flashing signals, no “trade now” prompts.

- **Language**:
  - **Plain everyday language**, but **serious** and **professional in content**.
  - Avoid financial jargon (e.g., no talk of beta, Sharpe, yield curves, etc.).
  - Focus on **“owning pieces of businesses for the long term”** rather than trading.

- **Visuals**:
  - No charts and no complex analytics screens.
  - Simple lists, concise labels, and enough whitespace.

### 8. Out-of-Scope (for this version)

The following are **explicitly out of scope** for the initial Timberline app:

- Trading execution or broker integrations.  
- Personalized portfolios or risk profiling.  
- User portfolio input, tracking, or performance analytics.  
- Non-U.S. assets (international stocks, bonds, funds, crypto, etc.).  
- Social features (comments, likes, feeds).  
- Advanced analytics, factor breakdowns, or backtests.  
- Marketing copy, pricing model, and legal wording (to be defined later).

### 9. High-Level Data Model (Conceptual)

At a high level, Timberline needs to represent:

- **Quarter**:
  - Identifier (e.g., `2025 Q1`).
  - Start and/or publication date.

- **Portfolio** (per quarter):
  - List of **~5 stock entries**, matching the 13F portfolio.
  - Optional weights (if used later).
  - Optional plain-language note for the quarter.

- **Stock entry**:
  - Ticker.
  - Company name.
  - Optional short note (e.g., 1–2 plain-language sentences).

- **Change set** (derived or stored) between two consecutive quarters:
  - Added stocks.
  - Removed stocks.

This is **not a final schema**, only guidance for implementation.

### 10. Guiding Principles

- **Simplicity over features**: fewer screens, fewer options, fewer decisions.  
- **Long-term orientation**: the quarterly cadence and low turnover emphasize patience.  
- **Clarity over jargon**: explain ideas in normal language or not at all.  
- **Focus**: a small number of carefully chosen stocks rather than a wide list.  


