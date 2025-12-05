import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Alert, Platform } from 'react-native';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

// Configure notification handler globally
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Request notification permission immediately on app launch
  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    const PUSH_TOKEN_REGISTERED_KEY = 'pushTokenRegisteredV1';

    (async () => {
      try {
        // Only register once per install.
        const alreadyRegistered = await SecureStore.getItemAsync(
          PUSH_TOKEN_REGISTERED_KEY,
        );
        if (alreadyRegistered === 'yes') {
          return;
        }

        // Show rationale before requesting OS permission
        await new Promise<void>((resolve) => {
          Alert.alert(
            'Stay in the loop',
            'Please allow notifications so you can relax and wait. We\'ll notify you about portfolio changes once per quarter.',
            [{ text: 'OK', onPress: () => resolve() }],
            { cancelable: false },
          );
        });

        // Request permission automatically on first launch (OS dialog)
        const settings = await Notifications.getPermissionsAsync();
        let granted = settings.granted;
        if (!granted) {
          const requestResult = await Notifications.requestPermissionsAsync();
          granted = requestResult.granted;
        }
        if (!granted) {
          return;
        }

        // Get push token and register with backend
        const tokenData = await Notifications.getExpoPushTokenAsync();

        // Register this device with the backend
        try {
          const res = await fetch(
            'https://timberline-app-emj2.vercel.app/api/push-tokens',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                token: tokenData.data,
                platform: Platform.OS,
              }),
            },
          );
          if (res.ok || res.status === 204) {
            await SecureStore.setItemAsync(PUSH_TOKEN_REGISTERED_KEY, 'yes');
          }
        } catch (e) {
          console.warn('Failed to register push token with backend', e);
        }
      } catch (e) {
        console.warn('Failed to initialize notifications', e);
      }
    })();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
