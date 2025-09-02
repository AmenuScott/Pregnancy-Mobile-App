import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    // Newer SDK fields (iOS 15+ style) default behaviors
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface UsePushNotificationsResult {
  expoPushToken: string | null;
  lastNotification: Notifications.Notification | null;
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
  try {
    if (!Device.isDevice) {
      console.log('Physical device required for push notifications');
      return null;
    }
    const perms = await Notifications.getPermissionsAsync();
    let status = perms.status;
    if (status !== 'granted') {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }
    if (status !== 'granted') return null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
    }
    const tokenData = await Notifications.getExpoPushTokenAsync();
    return tokenData.data;
  } catch (e) {
    console.log('Push registration error', e);
    return null;
  }
}

export function usePushNotifications(): UsePushNotificationsResult {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [lastNotification, setLastNotification] = useState<Notifications.Notification | null>(null);
  const receivedSub = useRef<any>(null);
  const responseSub = useRef<any>(null);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('expoPushToken');
      let token = stored;
      if (!token) {
        token = await registerForPushNotificationsAsync();
        if (token) await AsyncStorage.setItem('expoPushToken', token);
      }
      if (token) {
        setExpoPushToken(token);
        try {
          const userId = (await AsyncStorage.getItem('userId')) || (await AsyncStorage.getItem('user_id'));
          if (userId) {
            await fetch(`https://pregwell-backend.onrender.com/api/users/${userId}/push-token`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token }),
            });
          }
        } catch (err) {
          console.log('Persist token backend error', err);
        }
      }
    })();

    receivedSub.current = Notifications.addNotificationReceivedListener(n => setLastNotification(n));
    responseSub.current = Notifications.addNotificationResponseReceivedListener(r => setLastNotification(r.notification));
    return () => {
      if (receivedSub.current) Notifications.removeNotificationSubscription(receivedSub.current);
      if (responseSub.current) Notifications.removeNotificationSubscription(responseSub.current);
    };
  }, []);

  return { expoPushToken, lastNotification };
}
