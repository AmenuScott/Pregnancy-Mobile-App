import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Text, TouchableOpacity, View } from "react-native"

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)
  const router = useRouter()

  const fetchUnread = async () => {
    const userId = await AsyncStorage.getItem("user_id")
    if (!userId) return

    try {
      const res = await fetch(`https://pregwell-backend.onrender.com/api/notifications/${userId}`)
      const data = await res.json()

      // ✅ Safely check if response is an array
      if (Array.isArray(data)) {
        const unread = data.filter((n: any) => !n.is_read)
        setUnreadCount(unread.length)
      } else {
        console.warn("Unexpected notifications response:", data)
        setUnreadCount(0)
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error)
      setUnreadCount(0)
    }
  }

  useEffect(() => {
    fetchUnread()
  }, [])

  return (
    <TouchableOpacity
      onPress={() => router.push("/notifications")}
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
