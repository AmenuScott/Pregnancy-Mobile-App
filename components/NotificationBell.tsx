import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter } from "expo-router"
import { useEffect, useState, useCallback, useRef } from "react"
import * as Notifications from 'expo-notifications'
import { Text, TouchableOpacity, View } from "react-native"

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)
  const router = useRouter()

  const resolveUserId = useCallback(async () => {
    return (await AsyncStorage.getItem('userId')) || (await AsyncStorage.getItem('user_id')) || null
  }, [])

  const fetchUnread = useCallback(async () => {
    const uid = await resolveUserId();
    if (!uid) return;
    try {
      const res = await fetch(`https://pregwell-backend.onrender.com/api/notifications/${uid}`);
      const data = await res.json();
      setUnreadCount(Array.isArray(data) ? data.filter((n: any) => !n.is_read).length : 0);
    } catch { setUnreadCount(0); }
  }, [resolveUserId])

  const subRef = useRef<any>(null)
  useEffect(() => {
    fetchUnread();
    subRef.current = Notifications.addNotificationReceivedListener(() => fetchUnread());
    return () => { if (subRef.current) Notifications.removeNotificationSubscription(subRef.current); };
  }, [fetchUnread])

  return (
    <TouchableOpacity
  onPress={() => router.push("/Notification")}
      style={{ position: "relative", padding: 8 }}
    >
      <Ionicons name="notifications-outline" size={28} color="#9c27b0" />
      {unreadCount > 0 && (
        <View
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            backgroundColor: "#f44336",
            borderRadius: 12,
            minWidth: 18,
            height: 18,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 4
          }}
        >
          <Text style={{ color: "#fff", fontSize: 10, fontWeight: "bold" }}>
            {unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  )
}
