"use client"

import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import {
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

const { width } = Dimensions.get("window")
const statusBarHeight = Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 24

const PostnatalMenu = () => {
  const router = useRouter()
  const [userName, setUserName] = useState("Mama")
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId")
        if (!userId) return

        const res = await fetch(`https://pregwell-backend.onrender.com/api/${userId}`)
        const contentType = res.headers.get("content-type")

        if (contentType && contentType.includes("application/json")) {
          const data = await res.json()
          setUserName(data.first_name || "Mama")
        }
      } catch (err) {
        console.error("User fetch error:", err)
      }
    }

    fetchUserData()

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 17) return "Good Afternoon"
    return "Good Evening"
  }

  const getTimeOfDay = () => {
    const hour = currentTime.getHours()
    if (hour < 6) return "night"
    if (hour < 12) return "morning"
    if (hour < 17) return "afternoon"
    return "evening"
  }

  const sections = [
    {
      title: "Recovery Tips",
      subtitle: "Monitor your healing journey",
      icon: "fitness-outline",
      colors: ["#FF6B9D", "#C44569"],
      navigateTo: "/recovery", // Navigate to separate Recovery page
      progress: "75%",
    },
    {
      title: "Menstrual Cycle",
      subtitle: "Track your cycle's return",
      icon: "calendar-outline",
      colors: ["#FF9A56", "#FF6B35"],
      navigateTo: "/menstrual", // Navigate to separate Menstrual page
      progress: "Next: Mar 15",
    },
    {
      title: "Baby Care Guide",
      subtitle: "Essential care tips by age",
      icon: "heart-outline",
      colors: ["#4ECDC4", "#44A08D"],
      navigateTo: "/babycare", // Navigate to separate BabyCare page
      progress: "0-6 months",
    },
  ]

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />

      {/* Modern Header with Gradient */}
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>

            {/* Header Title */}
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Postnatal Care</Text>
              <View style={styles.headerBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#667eea" />
                <Text style={styles.headerBadgeText}>Comprehensive Care</Text>
              </View>
            </View>

            {/* Empty view for spacing */}
            <View style={{ width: 40 }} />
          </View>

          {/* Greeting Section */}
          <View style={[styles.greetingSection, { justifyContent: "center" }]}>
            <View style={styles.greetingContent}>
              <Text style={styles.greetingText}>
                {getGreeting()}, {userName}! 👋
              </Text>
              <Text style={styles.greetingSubtext}>How are you feeling this {getTimeOfDay()}?</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Main Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionTitle}>Your Care Journey</Text>
        <Text style={styles.sectionSubtitle}>Comprehensive support for your postpartum recovery</Text>

        {sections.map((section, index) => (
          <TouchableOpacity
            key={index}
            style={styles.cardWrapper}
            onPress={() => router.push(section.navigateTo)}
            activeOpacity={0.95}
          >
            <LinearGradient colors={section.colors} style={styles.card} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={styles.cardIconContainer}>
                  <Ionicons name={section.icon as any} size={28} color="white" />
                </View>
                <TouchableOpacity style={styles.cardMenuButton} activeOpacity={0.7}>
                  <Ionicons name="ellipsis-horizontal" size={18} color="rgba(255,255,255,0.8)" />
                </TouchableOpacity>
              </View>

              {/* Card Content */}
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{section.title}</Text>
                <Text style={styles.cardSubtitle}>{section.subtitle}</Text>

                {/* Progress Indicator */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressInfo}>
                    <Text style={styles.progressLabel}>Status</Text>
                    <Text style={styles.progressValue}>{section.progress}</Text>
                  </View>
                  <View style={styles.arrowContainer}>
                    <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
                  </View>
                </View>
              </View>

              {/* Decorative Elements */}
              <View style={styles.cardDecoration}>
                <View style={[styles.decorativeCircle, styles.circle1]} />
                <View style={[styles.decorativeCircle, styles.circle2]} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingTop: statusBarHeight,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  headerBadgeText: {
    fontSize: 11,
    color: "#667eea",
    fontWeight: "600",
    marginLeft: 4,
  },
  greetingSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  greetingContent: {
    flex: 1,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  greetingSubtext: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "400",
  },
  content: {
    flex: 1,
    marginTop: 10, // Add some spacing after header
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2d3748",
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: "#718096",
    marginBottom: 24,
    lineHeight: 22,
  },
  cardWrapper: {
    marginBottom: 20,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    minHeight: 140,
    position: "relative",
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardMenuButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 16,
    lineHeight: 20,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressInfo: {
    flex: 1,
  },
  progressLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 2,
  },
  progressValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardDecoration: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "100%",
    height: "100%",
    zIndex: -1,
  },
  decorativeCircle: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 50,
  },
  circle1: {
    width: 100,
    height: 100,
    top: -30,
    right: -30,
  },
  circle2: {
    width: 60,
    height: 60,
    bottom: -20,
    right: 20,
  },
})

export default PostnatalMenu
