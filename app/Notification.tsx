"use client"

import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import NotificationBell from "../components/NotificationBell"

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

const fetchNotifications = async () => {
  setLoading(true)

  try {
    const userId = await AsyncStorage.getItem("user_id")
    console.log("✅ Stored user_id is:", id);

    if (!userId) {
      console.warn("⚠️ No user_id found in AsyncStorage")
      setNotifications([])
      setLoading(false)
      return
    }

    const res = await fetch(`https://pregwell-backend.onrender.com/api/notifications/${userId}`)
    const data = await res.json()

    console.log("📨 Notifications response:", data)

    if (Array.isArray(data)) {
      setNotifications(data)
    } else {
      console.warn("⚠️ Expected an array but got:", data)
      setNotifications([])
    }
  } catch (error) {
    console.error("❌ Error fetching notifications:", error)
    setNotifications([])
  } finally {
    setLoading(false)
  }
}



  const markAsRead = async (id: string) => {
    try {
      await fetch(`https://pregwell-backend.onrender.com/api/notifications/${id}/mark-as-read`, {
        method: "PUT"
      })
      fetchNotifications()
    } catch (error) {
      console.error("Failed to mark as read", error)
    }
  }

  const deleteNotification = async (id: string) => {
    Alert.alert("Delete Notification", "Are you sure you want to delete this?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            await fetch(`https://pregwell-backend.onrender.com/api/notifications/${id}`, {
              method: "DELETE"
            })
            fetchNotifications()
          } catch (error) {
            console.error("Failed to delete", error)
          }
        }
      }
    ])
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const renderItem = ({ item }: any) => (
    <LinearGradient
      colors={item.is_read ? ["#f0f0f0", "#fafafa"] : ["#ffe6f0", "#f5e6ff"]}
      style={{
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: item.is_read ? "400" : "700", fontSize: 16 }}>{item.title}</Text>
          <Text style={{ fontSize: 14, color: "#555", marginTop: 4 }}>{item.message}</Text>
          <Text style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>
            {new Date(item.created_at).toLocaleString()}
          </Text>
        </View>
        <TouchableOpacity onPress={() => deleteNotification(item.id)}>
          <Ionicons name="trash-outline" size={20} color="#d33" />
        </TouchableOpacity>
      </View>

      {!item.is_read && (
        <TouchableOpacity
          onPress={() => markAsRead(item.id)}
          style={{
            marginTop: 10,
            alignSelf: "flex-start",
            backgroundColor: "#d1c4e9",
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 20
          }}
        >
          <Text style={{ fontSize: 12, color: "#333" }}>Mark as Read</Text>
        </TouchableOpacity>
      )}
    </LinearGradient>
  )

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#fff" }}>
      <View style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20
      }}>
        <Text style={{ fontSize: 24, fontWeight: "700" }}>Notifications</Text>
        <NotificationBell />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#9c27b0" />
      ) : error ? (
        <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>
      ) : notifications.length === 0 ? (
        <Text style={{ textAlign: "center", color: "#777" }}>
          No notifications yet. Try adding some manually in the database.
        </Text>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  )
}
