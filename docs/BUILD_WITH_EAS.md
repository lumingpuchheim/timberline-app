## Building the Timberline app with EAS

This document summarizes how to build the Timberline app with Expo Application Services (EAS), so you can get a native binary that supports notifications.

---

### 1. Prerequisites

- Expo account (free is enough for basic builds)
- Node.js and npm installed
- Project checked out locally at:

```bash
cd C:\Users\user\workspace\timberline
```

---

### 2. Install EAS CLI

You only need to do this once per machine:

```bash
npm install -g eas-cli
```

You can verify it with:

```bash
eas --version
```

---

### 3. Log in to Expo

From the `timberline` folder:

```bash
cd C:\Users\user\workspace\timberline
eas login
```

Follow the prompts to log into your Expo account.

---

### 4. Build configuration in this project

The file `eas.json` in the `timberline` folder already defines three build profiles:

- `development`: development client (for debugging, internal distribution)
- `preview`: internal test builds
- `production`: production builds (auto-incrementing version)

You normally care about:

- `development` when you want a debug build to test notifications and code changes.
- `production` when you want a store-ready binary.

---

### 5. Building for Android

From the `timberline` folder:

#### 5.1 Development build (recommended for testing notifications)

```bash
cd C:\Users\user\workspace\timberline
eas build --platform android --profile development
```

This will:

- Upload your project.
- Build an Android dev client in the cloud.
- Show you a URL/QR code where you can download the `.apk` (or install via Expo Go app link).

Use this when you are iterating on the app and need to test push notifications and other native features.

#### 5.2 Production build

```bash
cd C:\Users\user\workspace\timberline
eas build --platform android --profile production
```

This will create a production build (usually an `.aab` for the Play Store or a `.apk` for direct install).

You can monitor builds at:

- Expo dashboard → **Builds** for your project.

---

### 6. Installing and testing the build

1. After the build finishes, open the link shown in the terminal or in the Expo dashboard.
2. Download the Android build (`.apk`):
   - For a physical device: open the link on the device and install.
   - For an emulator: drag and drop the `.apk` into the emulator window or use `adb install`.
3. Once installed:
   - Open the app on the device.
   - The notification hook in `app/(tabs)/index.tsx` will:
     - Ask for notification permission.
     - Request the Expo push token.
     - Send it once to `https://timberline-app-emj2.vercel.app/api/push-tokens`.

You can then use your backend or GitHub Action to send test notifications to that token.

---

### 7. Rebuilding after code changes

Whenever you change native-related code or want to test a new version:

- For dev builds:

```bash
cd C:\Users\user\workspace\timberline
eas build --platform android --profile development
```

- For production builds:

```bash
cd C:\Users\user\workspace\timberline
eas build --platform android --profile production
```

You can have multiple builds; EAS and the Expo dashboard keep history so you can reinstall older builds if needed.


