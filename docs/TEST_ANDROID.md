# Build on EAS. It takes time to wait for EAS and to build
cd timberline
eas build --platform android --profile development   # or production if you prefer

# Test locally
cd timberline
npx expo run:android