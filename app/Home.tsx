"use client"

import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { getAuthData, clearAuthData } from "./utils/authUtils"
import { BlurView } from "expo-blur"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import type { ColorValue } from "react-native"
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import ProfileHeader from "../components/ProfileHeader"
import ErrorBoundary from "../components/ErrorBoundary"
import socket from "./utils/socket"


const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, fontSize: 16, color: "#7F8C8D", fontWeight: "500" },
  header: {
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
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
  try {
    // Validate input
    if (!lmp) {
      throw new Error("LMP date is required")
    }

    const lmpDate = new Date(lmp)
    
    // Check if date is valid
    if (isNaN(lmpDate.getTime())) {
      throw new Error("Invalid LMP date")
    }

    const today = new Date()
    const daysSinceLMP = Math.floor((today.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24))
    
    // Check for unrealistic dates
    if (daysSinceLMP < 0) {
      throw new Error("LMP cannot be in the future")
    }
    
    if (daysSinceLMP > 350) { // More than 50 weeks
      throw new Error("LMP date seems too far in the past")
    }

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
  } catch (error) {
    console.error("Error calculating pregnancy data:", error)
    // Return safe default values
    return {
      totalWeeks: 0,
      extraDays: 0,
      trimester: 1,
      trimesterText: "1st Trimester",
      remainingWeeks: 40,
      progressPercentage: 0,
      babySize: "precious baby 👶🏾",
      isOverdue: false,
    }
  }
}

const HomeScreen = () => {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData>(null)
  const [pregnancyData, setPregnancyData] = useState<PregnancyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true)
      const { token, userId } = await getAuthData()
      
      if (!token || !userId) {
        console.error("Authentication data missing - redirecting to login")
        router.replace("/login")
        return
      }

      const response = await fetch(`https://pregwell-backend.onrender.com/api/patients/profile/${userId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          console.error("Authentication failed - redirecting to login")
          await clearAuthData()
          router.replace("/login")
          return
        }
        throw new Error(`Failed to fetch user profile: ${response.status}`)
      }

      const data = await response.json()
      
      // Add safety checks for API response data
      const userProfile = {
        firstName: data.first_name || "User",
        lastName: data.last_name || "",
        lastMenstrualPeriod: data.last_menstrual_period,
        profilePicture: null,
      }
      
      setUserData(userProfile)
      
      // Only calculate pregnancy data if LMP exists and is valid
      if (userProfile.lastMenstrualPeriod) {
        try {
          setPregnancyData(calculatePregnancy(userProfile.lastMenstrualPeriod))
        } catch (pregnancyError) {
          console.error("Error calculating pregnancy data:", pregnancyError)
          // Continue without pregnancy data rather than crashing
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      // Don't crash the app, just show default state
      setUserData({
        firstName: "User",
        lastName: "",
        lastMenstrualPeriod: null,
        profilePicture: null,
      })
    } finally {
      setLoading(false)
    }
  }, [router])

  // 📱 Fetch unread message count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const { token, userId } = await getAuthData()
      if (!token || !userId) return

      const response = await fetch(`https://pregwell-backend.onrender.com/api/messages/inbox/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        const totalUnread = data.reduce((sum: number, chat: any) => sum + (chat.unreadCount || 0), 0)
        setUnreadMessageCount(totalUnread)
      }
    } catch (error) {
      console.error("Error fetching unread count:", error)
    }
  }, [])

  // 📡 Real-time unread count updates
  useEffect(() => {
    fetchUnreadCount()
    
    // Add error handling for socket connection
    const handleSocketError = (error: any) => {
      console.error("Socket connection error:", error)
    }

    const handleReceiveMessage = (msg: any) => {
      try {
        AsyncStorage.getItem("userId").then(userId => {
          if (msg?.receiver_id === userId) {
            setUnreadMessageCount(prev => prev + 1)
          }
        }).catch(err => {
          console.error("Error handling received message:", err)
        })
      } catch (error) {
        console.error("Error in receive_message handler:", error)
      }
    }

    const handleMessagesRead = ({ senderId, receiverId }: { senderId: string; receiverId: string }) => {
      try {
        AsyncStorage.getItem("userId").then(userId => {
          if (receiverId === userId) {
            fetchUnreadCount()
          }
        }).catch(err => {
          console.error("Error handling messages read:", err)
        })
      } catch (error) {
        console.error("Error in messages_read handler:", error)
      }
    }

    // Set up socket listeners with error handling
    socket.on("connect_error", handleSocketError)
    socket.on("error", handleSocketError)
    socket.on("receive_message", handleReceiveMessage)
    socket.on("messages_read", handleMessagesRead)

    return () => {
      socket.off("connect_error", handleSocketError)
      socket.off("error", handleSocketError)
      socket.off("receive_message", handleReceiveMessage)
      socket.off("messages_read", handleMessagesRead)
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
    <SafeAreaView style={s.container}>
      <LinearGradient colors={["#E0BBFF", "#9C27B0", "#7B1FA2"]} style={s.header}>
        <View style={s.headerTop}>
          <TouchableOpacity onPress={() => router.push("/Profile")}>
            <ProfileHeader name={fullName} profilePicture={userData?.profilePicture} />
          </TouchableOpacity>
          <TouchableOpacity style={s.notificationButton} onPress={() => router.push("/Notification")}>
            <View style={s.notificationBadge}>
              <Ionicons name="notifications" size={22} color="#9C27B0" />
              <View style={s.notificationDot} />
            </View>
          </TouchableOpacity>
        </View>
        <View style={s.greeting}>
          <Text style={s.greetingText}>Welcome {firstName}! 🌺</Text>
          <Text style={s.subGreeting}>How are you feeling today?</Text>
        </View>
        <LinearGradient colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0.1)"]} style={s.trimesterPill}>
          <Ionicons name="flower" size={16} color="white" />
          <Text style={s.trimesterText}>
            {pregnancyData
              ? `${pregnancyData.trimesterText} • Week ${pregnancyData.totalWeeks}`
              : "Your Journey"}
          </Text>
        </LinearGradient>
      </LinearGradient>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 10, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Debug: Test if content is rendering */}
        <Text style={{ padding: 20, fontSize: 16, textAlign: 'center', backgroundColor: '#fff', margin: 20, borderRadius: 10 }}>
          🔍 Content is loading... {userData ? 'User data loaded' : 'Loading user data'}
        </Text>
        
        {/* Tracker Card */}
        <View style={s.tracker}>
          <LinearGradient colors={["#FFE4E6", "#FFF0F3"]} style={s.trackerContent}>
            <View style={s.trackerHeader}>
              <View>
                <Text style={s.trackerTitle}>Your Pregnancy Journey</Text>
                <Text style={s.trackerWeeks}>
                  {pregnancyData
                    ? pregnancyData.isOverdue
                      ? "Baby is ready to meet you! 🎉"
                      : `${pregnancyData.remainingWeeks} weeks to go! 🎉`
                    : "Track your progress"}
                </Text>
              </View>
              <View style={s.babyIcon}>
                <Text style={{ fontSize: 24 }}>👶🏾</Text>
              </View>
            </View>
            <View style={{ marginTop: 15, marginBottom: 15 }}>
              <View style={s.progressBar}>
                <LinearGradient
                  colors={["#FF6B9D", "#C44569"]}
                  style={[s.progressFill, { width: pregnancyData ? `${pregnancyData.progressPercentage}%` : "0%" }]}
                />
              </View>
              <Text style={s.progressText}>
                {pregnancyData ? `${pregnancyData.progressPercentage}% Complete` : "0% Complete"}
              </Text>
            </View>
            <Text style={{ fontSize: 14, color: "#34495E", fontWeight: "500" }}>
              {pregnancyData
                ? `Your baby is about the size of a ${pregnancyData.babySize}!`
                : "Your baby is growing beautifully! 🌱"}
            </Text>
          </LinearGradient>
        </View>

        <Section
          title="Health & Wellness"
          icon="medkit-outline"
          cards={[
            {
              title: "Symptom Check",
              subtitle: "Check your symptoms",
              icon: "medical-outline",
              colors: ["#FFE4E6", "#FFF0F3"],
              onPress: () => router.push("/Symptoms"),
            },
            {
              title: "Health Tips",
              subtitle: "Daily guidance",
              icon: "bulb-outline",
              colors: ["#FFF4E6", "#FFFAF0"],
              onPress: () => router.push("/Tips"),
            },
          ]}
        />

        <Section
          title="Lifestyle"
          icon="leaf-outline"
          cards={[
            {
              title: "Nutrition",
              subtitle: "Healthy eating",
              icon: "nutrition-outline",
              colors: ["#E8F5E8", "#F0FFF0"],
              onPress: () => router.push("/Diet"),
            },
            {
              title: "Exercise",
              subtitle: "Stay active",
              icon: "fitness-outline",
              colors: ["#E3F2FD", "#F0F8FF"],
              onPress: () => router.push("/Exercises"),
            },
          ]}
        />

        <Section
          title="Community"
          icon="people-outline"
          cards={[
            {
              title: "AI Assistant",
              subtitle: "24/7 support",
              icon: "chatbubble-ellipses-outline",
              colors: ["#F3E5F5", "#FAF0FC"],
              onPress: () => router.push("/myAI"),
            },
            {
              title: "Messages",
              subtitle: "Connect with others",
              icon: "chatbubbles-outline",
              colors: ["#FFF3E0", "#FFFAF0"],
              onPress: () => router.push("/Messages"),
              unreadCount: unreadMessageCount,
            },
          ]}
        />

        {/* Post Natal Care Section */}
        {pregnancyData && pregnancyData.trimester === 3 && !pregnancyData.isOverdue ? (
          <FullWidthButton
            title="Post Natal Care"
            subtitle="Recovery & baby care support"
            icon="heart"
            colors={["#E91E63", "#D81B60"]}
            shadowColor="#E91E63"
            onPress={() => router.push("/PostNatal")}
          />
        ) : (
          <View style={[s.fullWidth, { marginBottom: 20, overflow: "hidden", shadowColor: "#E91E63" }]}>
            <View pointerEvents="none">
              <FullWidthButton
                title="Post Natal Care"
                subtitle="Recovery & baby care support"
                icon="heart"
                colors={["#E91E63", "#D81B60"]}
                shadowColor="#E91E63"
                onPress={() => {}}
              />
            </View>
            <BlurView
              intensity={60}
              tint="dark"
              style={StyleSheet.absoluteFill}
            >
              <View style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 15,
                backgroundColor: "rgba(0,0,0,0.35)",
              }}>
                <Text style={{
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: 16,
                  textAlign: "center",
                  textShadowColor: "#000",
                  textShadowRadius: 8,
                }}>
                  Post Natal Section
                  Available in 3rd Trimester
                </Text>
              </View>
            </BlurView>
          </View>
        )}

        <FullWidthButton
          title="Emergency Help"
          icon="medical"
          colors={["#FF5722", "#D32F2F"]}
          shadowColor="#FF5722"
          onPress={() => router.push("/Emergency")}
        />

        <View style={s.quote}>
          <LinearGradient colors={["#FFF8E1", "#FFFEF7"]} style={s.quoteContent}>
            <Ionicons name="heart" size={20} color="#F8B500" style={{ marginBottom: 10 }} />
            <Text style={s.quoteText}>
              {pregnancyData && pregnancyData.trimester === 1
                ? "Every day of pregnancy is a step closer to meeting your miracle."
                : pregnancyData && pregnancyData.trimester === 2
                  ? "You are growing a human being. That's pretty amazing!"
                  : "A baby is something you carry inside you for nine months, in your arms for three years, and in your heart until the day you die."}
            </Text>
            <Text style={s.quoteAuthor}>- With Love 💕</Text>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  )
}

// Section component for repeated sections
const Section = ({
  title,
  icon,
  cards,
}: {
  title: string
  icon: string
  cards: (CardProps & { unreadCount?: number })[]
}) => (
  <>
    <View style={s.sectionHeader}>
      <Text style={s.sectionTitle}>{title}</Text>
      <Ionicons name={icon as any} size={20} color="#C44569" />
    </View>
    <View style={s.grid}>
      {cards.map((card, idx) => (
        <Card key={card.title + idx} {...card} />
      ))}
    </View>
  </>
)

// Wrap HomeScreen with ErrorBoundary
const HomeScreenWithErrorBoundary = () => (
  <ErrorBoundary>
    <HomeScreen />
  </ErrorBoundary>
)

// Temporary simple version for testing
import HomeTest from './HomeTest';

export default HomeTest // Temporarily use simple version
