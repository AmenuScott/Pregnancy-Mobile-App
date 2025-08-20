"use client"

import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native"
import ErrorBoundary from '../components/ErrorBoundary'
import ProfileHeader from "../components/ProfileHeader"
import socket from "./utils/socket"


const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, fontSize: 16, color: "#7F8C8D", fontWeight: "500" },
  header: {
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 55,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  notificationButton: { padding: 8 },
  notificationBadge: { backgroundColor: "white", borderRadius: 20, padding: 8, position: "relative" },
  notificationDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    backgroundColor: "#FF4444",
    borderRadius: 4,
  },
  greeting: { marginBottom: 15 },
  greetingText: { color: "white", fontSize: 24, fontWeight: "bold", marginBottom: 5 },
  subGreeting: { color: "rgba(255,255,255,0.9)", fontSize: 16 },
  trimesterPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    alignSelf: "flex-start",
  },
  trimesterText: { color: "white", fontSize: 14, fontWeight: "600", marginLeft: 8 },
  scroll: { flex: 1 },
  tracker: {
    marginHorizontal: 20,
    marginTop: 5,
    marginBottom: 25,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  trackerContent: { padding: 20, borderRadius: 20 },
  trackerHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  trackerTitle: { fontSize: 18, fontWeight: "bold", color: "#2C3E50", marginBottom: 4 },
  trackerWeeks: { fontSize: 14, color: "#7F8C8D", fontWeight: "500" },
  babyIcon: {
    backgroundColor: "white",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255, 9, 91, 0.2)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: { height: "100%", borderRadius: 4 },
  progressText: { fontSize: 12, color: "#7F8C8D", fontWeight: "500", textAlign: "right" },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#2C3E50" },
  grid: { flexDirection: "row", justifyContent: "space-between", marginHorizontal: 20, marginBottom: 20 },
  card: { width: "48%", borderRadius: 18, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 6, elevation: 4 },
  cardContent: { padding: 20, borderRadius: 18, alignItems: "center" },
  iconContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", textAlign: "center", color: "#2C3E50", marginBottom: 4 },
  cardSubtitle: { fontSize: 12, color: "#7F8C8D", textAlign: "center", fontWeight: "500" },
  unreadBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  unreadText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  fullWidth: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  fullWidthContent: { borderRadius: 15, paddingVertical: 16, paddingHorizontal: 20 },
  emergencyContent: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  emergencyText: { color: "white", fontSize: 18, fontWeight: "bold", marginHorizontal: 12 },
  quote: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quoteContent: { padding: 20, borderRadius: 18, alignItems: "center" },
  quoteText: {
    fontSize: 14,
    color: "#34495E",
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 20,
    marginBottom: 8,
  },
  quoteAuthor: { fontSize: 12, color: "#7F8C8D", fontWeight: "500" },
  menuText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
})

const babySizes: { [key: string]: string } = {
  4: "poppy seed 🌱",
  8: "kidney bean 🫘",
  12: "lime 🍋",
  16: "avocado 🥑",
  20: "banana 🍌",
  24: "corn 🌽",
  28: "eggplant 🍆",
  32: "jicama 🟤",
  36: "papaya 🟠",
  40: "pumpkin 🎃",
}

type UserData = {
  firstName: string
  lastName: string
  lastMenstrualPeriod: string
  profilePicture: string | null
} | null

type PregnancyData = {
  totalWeeks: number
  extraDays: number
  trimester: number
  trimesterText: string
  remainingWeeks: number
  progressPercentage: number
  babySize: string
  isOverdue: boolean
}

type CardProps = {
  title: string
  subtitle: string
  icon: string
  colors: [ColorValue, ColorValue, ...ColorValue[]]
  onPress: () => void
  unreadCount?: number
}

const Card = ({ title, subtitle, icon, colors, onPress, unreadCount }: CardProps) => (
  <TouchableOpacity style={s.card} onPress={onPress}>
    <LinearGradient colors={colors} style={s.cardContent}>
      <View style={s.iconContainer}>
        <Ionicons name={icon as any} size={28} color="#6c5ce7" />
      </View>
      <Text style={s.cardTitle}>{title}</Text>
      <Text style={s.cardSubtitle}>{subtitle}</Text>
      {unreadCount && unreadCount > 0 && (
        <View style={s.unreadBadge}>
          <Text style={s.unreadText}>
            {unreadCount > 99 ? "99+" : String(unreadCount)}
          </Text>
        </View>
      )}
    </LinearGradient>
  </TouchableOpacity>
)

type FullWidthButtonProps = {
  title: string
  subtitle?: string
  icon: string
  colors: [ColorValue, ColorValue, ...ColorValue[]]
  onPress: () => void
  shadowColor?: ColorValue
}

const FullWidthButton = ({ title, subtitle, icon, colors, onPress, shadowColor }: FullWidthButtonProps) => (
  <TouchableOpacity style={[s.fullWidth, { shadowColor }]} onPress={onPress}>
    <LinearGradient colors={colors} style={s.fullWidthContent}>
      <View style={s.emergencyContent}>
        <Ionicons name={'warning'} size={24} color="white" />
        <Text style={s.emergencyText}>{title}</Text>
        {subtitle && <Ionicons name="call" size={20} color="white" />}
      </View>
    </LinearGradient>
  </TouchableOpacity>
)

const calculatePregnancy = (lmp: string | number | Date): PregnancyData => {
  const lmpDate = new Date(lmp)
  const today = new Date()
  const daysSinceLMP = Math.floor((today.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24))
  const totalWeeks = Math.floor(daysSinceLMP / 7)
  const extraDays = daysSinceLMP % 7

  const trimester = totalWeeks <= 12 ? 1 : totalWeeks <= 27 ? 2 : 3
  const trimesterText = `${trimester}${trimester === 1 ? "st" : trimester === 2 ? "nd" : "rd"} Trimester`

  const dueDate = new Date(lmpDate)
  dueDate.setDate(dueDate.getDate() + 280)
  const remainingDays = Math.max(0, Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
  const remainingWeeks = Math.floor(remainingDays / 7)
  const progressPercentage = Math.min(100, Math.round((totalWeeks / 40) * 100))

  const babySize = babySizes[String(Math.floor(totalWeeks / 4) * 4)] || babySizes["40"] || "precious baby 👶🏾"

  return {
    totalWeeks,
    extraDays,
    trimester,
    trimesterText,
    remainingWeeks,
    progressPercentage,
    babySize,
    isOverdue: totalWeeks > 40,
  }
}

const HomeScreen = () => {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData>(null)
  const [pregnancyData, setPregnancyData] = useState<PregnancyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)
  const [hasNotifications, setHasNotifications] = useState(false)

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true)
      const [token, userId] = await Promise.all([
        AsyncStorage.getItem("token"),
        AsyncStorage.getItem("userId")
      ])

      if (!token || !userId) {
        console.log("No token or userId found")
        router.replace("/login")
        return
      }

      const response = await fetch(`https://pregwell-backend.onrender.com/api/patients/profile/${userId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      })

      if (!response.ok) throw new Error("Failed to fetch profile")
      
      const data = await response.json()
      const userProfile = {
        firstName: data.first_name,
        lastName: data.last_name,
        lastMenstrualPeriod: data.last_menstrual_period,
        profilePicture: null,
      }
      
      setUserData(userProfile)
      if (userProfile.lastMenstrualPeriod) {
        setPregnancyData(calculatePregnancy(userProfile.lastMenstrualPeriod))
      }
    } catch (error) {
      console.error("Error in fetchUserData:", error)
      Alert.alert(
        "Error",
        "Could not load your profile. Please try again.",
        [
          { text: "Retry", onPress: () => fetchUserData() },
          { text: "Logout", onPress: () => router.replace("/login") }
        ]
      )
    } finally {
      setLoading(false)
    }
  }, [router])

  // 📱 Fetch unread message count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token")
      const userId = await AsyncStorage.getItem("userId")
      if (!token || !userId) return

      const response = await fetch(`https://pregwell-backend.onrender.com/api/messages/inbox/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        const totalUnread = data.reduce((sum: number, chat: any) => sum + (chat.unreadCount || 0), 0)
        setUnreadMessageCount(totalUnread)
        setHasNotifications(totalUnread > 0)
      }
    } catch (error) {
      console.error("Error fetching unread count:", error)
    }
  }, [])

  // 📡 Real-time unread count updates
  useEffect(() => {
    if (!socket?.connected) {
      console.log("Socket not connected")
      return
    }

    try {
      fetchUnreadCount()
      
      socket.on("receive_message", (msg: any) => {
        AsyncStorage.getItem("userId")
          .then(userId => {
            if (msg?.receiver_id === userId) {
              setUnreadMessageCount(prev => prev + 1)
              setHasNotifications(true)
            }
          })
          .catch(err => console.log("AsyncStorage error:", err))
      })

      return () => {
        socket.off("receive_message")
        socket.off("messages_read")
      }
    } catch (error) {
      console.error("Socket error:", error)
    }
  }, [fetchUnreadCount])

  useEffect(() => {
    fetchUserData()
  }, [fetchUserData])

  if (loading) {
    return (
      <View style={s.loading}>
        <ActivityIndicator size="large" color="#9C27B0" />
        <Text style={s.loadingText}>Loading your journey...</Text>
      </View>
    )
  }

  const firstName = userData?.firstName || "Beautiful"
  const fullName = `${userData?.firstName || ""} ${userData?.lastName || ""}`.trim()

  return (
    <View style={s.container}>
      <LinearGradient colors={["#E0BBFF", "#9C27B0", "#7B1FA2"]} style={s.header}>
        <SafeAreaView>
          <View style={s.headerTop}>
            <TouchableOpacity onPress={() => router.push("/Profile")}>
              <ProfileHeader
                name={fullName}
                profilePicture={userData?.profilePicture}
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={s.notificationButton} 
              onPress={() => router.push("/Notification")}
            >
              <View style={s.notificationBadge}>
                <Ionicons name="notifications" size={22} color="#9C27B0" />
                {hasNotifications && <View style={s.notificationDot} />}
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={s.greeting}>
            <Text style={s.greetingText}>Welcome {firstName}! 🌺</Text>
            <Text style={s.subGreeting}>How are you feeling today?</Text>
          </View>

          <LinearGradient 
            colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0.1)"]} 
            style={s.trimesterPill}
          >
            <Ionicons name="flower" size={16} color="white" />
            <Text style={s.trimesterText}>
              {pregnancyData
                ? `${pregnancyData.trimesterText} • Week ${pregnancyData.totalWeeks}`
                : "Your Journey"}
            </Text>
          </LinearGradient>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Menu Items */}
        <TouchableOpacity onPress={() => router.push("/Messages")}>
          <LinearGradient
            colors={["#9C27B0", "#7B1FA2"]}
            style={s.menuItem}
          >
            <Text style={s.menuText}>Messages</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* More menu items... */}
      </ScrollView>
    </View>
  )
}

// Wrap with ErrorBoundary
const HomeScreenWithErrorBoundary = () => (
  <ErrorBoundary>
    <HomeScreen />
  </ErrorBoundary>
)

export default HomeScreenWithErrorBoundary
