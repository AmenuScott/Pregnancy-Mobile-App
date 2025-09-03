import AsyncStorage from '@react-native-async-storage/async-storage';

const ALLOWED = new Set([
  'app_open',
  'symptom_logged',
  'menstrual_logged',
  'baby_dob_saved',
  'notification_opened',
  'chat_message_sent'
]);

export async function track(name: string, props: Record<string, any> = {}) {
  if (!ALLOWED.has(name)) return;
  try {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) return;
    await fetch('https://pregwell-backend.onrender.com/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, name, ts: Date.now(), props })
    });
  } catch (e) {
    // Silent fail for MVP
  }
}

export async function fetchAnalyticsSummary() {
  try {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) return null;
    const res = await fetch(`https://pregwell-backend.onrender.com/api/analytics/summary?userId=${userId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
