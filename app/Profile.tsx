"use client"

import AsyncStorage from "@react-native-async-storage/async-storage"
import type React from "react"

import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

const { width, height } = Dimensions.get("window")

interface UserProfile {
  name: string
  email: string
  phone: string
  dueDate: string
  pregnancyWeek: number
  profileImage?: string
}

interface Tip {
  id: string
  title: string
  content: string
  icon: string
  color: string
}

// Helper to get initials
function getInitials(name: string) {
  if (!name) return "";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const ProfileScreen = () => {
  const router = useRouter()

  // User data from backend
  const [profile, setProfile] = useState<{
    fullName: string
    email: string
    dob: string
    lastMenstrualPeriod: string
    dueDate: string
    profileImage?: string
  } | null>(null)
  const [pregnancyInfo, setPregnancyInfo] = useState<{ week: number; trimester: string; dueDate: string } | null>(null)
  const [tips] = useState<Tip[]>([
    {
      id: "1",
      title: "Stay Hydrated",
      content: "Drinking enough water is essential for you and your baby's health. Aim for 8-10 glasses daily.",
      icon: "water",
      color: "#4ECDC4",
    },
    {
      id: "2",
      title: "Prenatal Vitamins",
      content: "Don't forget to take your prenatal vitamins every day to support healthy development.",
      icon: "medical",
      color: "#FF6B9D",
    },
    {
      id: "3",
      title: "Gentle Exercise",
      content: "Light activities like walking can boost your mood, energy, and overall health.",
      icon: "fitness",
      color: "#FFA726",
    },
  ])

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const profileScaleAnim = useRef(new Animated.Value(0.9)).current
  const cardAnimations = useRef(Array.from({ length: 6 }, () => new Animated.Value(0))).current
  const bubbleAnim1 = useRef(new Animated.Value(0)).current
  const bubbleAnim2 = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("token")
        const userId = await AsyncStorage.getItem("userId")
        if (!token || !userId) return

        const response = await fetch(`https://pregwell-backend.onrender.com/api/profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) return
        const data = await response.json()
        setProfile({
          fullName: `${data.first_name} ${data.last_name}`,
          email: data.email,
          dob: data.dob,
          lastMenstrualPeriod: data.last_menstrual_period,
          dueDate: data.due_date || "", // If your backend provides due_date
          profileImage: data.profile_picture || undefined,
        })

        // Calculate pregnancy week, trimester, and due date
        if (data.last_menstrual_period) {
          const lmpDate = new Date(data.last_menstrual_period)
          const today = new Date()
          const days = Math.floor((today.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24))
          const week = Math.floor(days / 7)
          let trimester = "1st Trimester"
          if (week > 27) trimester = "3rd Trimester"
          else if (week > 12) trimester = "2nd Trimester"
          // Calculate due date (LMP + 280 days)
          const dueDateObj = new Date(lmpDate)
          dueDateObj.setDate(lmpDate.getDate() + 280)
          const dueDateStr = dueDateObj.toLocaleDateString()
          setPregnancyInfo({ week, trimester, dueDate: dueDateStr })
        }
      } catch (e) {
        // fail silently
      }
    }
    fetchProfile()
    startAnimations()
  }, [])

  const startAnimations = () => {
    // Main fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start()

    // Profile card scale animation
    Animated.spring(profileScaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start()

    // Content slide up
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
    }).start()

    // Staggered card animations
    cardAnimations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 600,
        delay: 400 + index * 150,
        useNativeDriver: true,
      }).start()
    })

    // Background bubble animations
    startBubbleAnimations()
  }

  const startBubbleAnimations = () => {
    const createBubbleAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: 4000,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]),
      )
    }

    createBubbleAnimation(bubbleAnim1, 0).start()
    createBubbleAnimation(bubbleAnim2, 2000).start()
  }

  const renderAnimatedCard = (index: number, children: React.ReactNode, style?: any) => (
    <Animated.View
      style={[
        styles.animatedCard,
        style,
        {
          opacity: cardAnimations[index],
          transform: [
            {
              translateY: cardAnimations[index].interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  )

  const renderProfileHeader = () => (
    <Animated.View
      style={[
        styles.profileContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: profileScaleAnim }],
        },
      ]}
    >
      <LinearGradient colors={["#FF6B9D", "#9C27B0"]} style={styles.profileGradient}>
        {/* Profile Image or Initials */}
        <View style={styles.profileImageContainer}>
          <View style={styles.profileImageWrapper}>
            {profile?.profileImage ? (
              <Image source={{ uri: profile.profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={{ fontSize: 40, color: "#9C27B0", fontWeight: "bold" }}>
                  {getInitials(profile?.fullName || "U")}
                </Text>
              </View>
            )}
          </View>
          {/* Removed camera icon */}
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{profile?.fullName || "User"}</Text>
          <Text style={styles.profileEmail}>{profile?.email || ""}</Text>
          {pregnancyInfo && (
            <Text style={[styles.profilePhone, { marginBottom: 0 }]}>
              {pregnancyInfo.trimester}
            </Text>
          )}

          {/* Pregnancy Progress */}
          {pregnancyInfo && (
            <View style={styles.pregnancyProgress}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Week {pregnancyInfo.week}</Text>
                <Text style={styles.progressSubtitle}>
                  {40 - pregnancyInfo.week} weeks to go
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <Animated.View style={[styles.progressFill, { width: `${(pregnancyInfo.week / 40) * 100}%` }]} />
                </View>
                <Text style={styles.progressPercentage}>{Math.round((pregnancyInfo.week / 40) * 100)}%</Text>
              </View>
            </View>
          )}

          {/* Due Date */}
          {pregnancyInfo && (
            <View style={styles.dueDateContainer}>
              <Ionicons name="calendar" size={16} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.dueDateText}>Due: {pregnancyInfo.dueDate}</Text>
            </View>
          )}
        </View>

        {/* Edit Button */}
        <TouchableOpacity style={styles.editButton} onPress={() => router.push("/EditProfile")} activeOpacity={0.8}>
          <Ionicons name="pencil" size={18} color="#9C27B0" />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  )

  const renderTipsSection = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Tips & Updates</Text>
      {tips.map((tip, index) =>
        renderAnimatedCard(
          index,
          <TouchableOpacity key={tip.id} style={styles.tipCard} activeOpacity={0.7}>
            <View style={[styles.tipIconContainer, { backgroundColor: `${tip.color}20` }]}>
              <Ionicons name={tip.icon as any} size={24} color={tip.color} />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipDescription}>{tip.content}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>,
        ),
      )}
    </View>
  )

  const renderSettingsSection = () => {
    const settingsOptions = [
      { title: "Account Settings", icon: "person-outline", route: "/Settings", color: "#4ECDC4" },
      { title: "Privacy", icon: "shield-outline", route: "/Privacy", color: "#FF6B9D" },
      { title: "Notifications", icon: "notifications-outline", route: "/Notification", color: "#FFA726" },
      { title: "Language", icon: "language-outline", route: "/Language", color: "#9C27B0" },
    ]

    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Settings</Text>
        {renderAnimatedCard(
          3,
          <View style={styles.settingsCard}>
            {settingsOptions.map((option, index) => (
              <TouchableOpacity
                key={option.title}
                style={[styles.settingItem, index === settingsOptions.length - 1 && styles.lastSettingItem]}
                onPress={() => router.push(option.route as any)}
                activeOpacity={0.7}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIconContainer, { backgroundColor: `${option.color}20` }]}>
                    <Ionicons name={option.icon as any} size={20} color={option.color} />
                  </View>
                  <Text style={styles.settingText}>{option.title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            ))}
          </View>,
        )}
      </View>
    )
  }

  const renderLogoutButton = () =>
    renderAnimatedCard(
      4,
      <TouchableOpacity style={styles.logoutButton} onPress={() => router.push("/Logout")} activeOpacity={0.8}>
        <LinearGradient colors={["#FF5722", "#D32F2F"]} style={styles.logoutGradient}>
          <Ionicons name="log-out-outline" size={20} color="white" />
          <Text style={styles.logoutText}>Log Out</Text>
        </LinearGradient>
      </TouchableOpacity>,
      styles.logoutContainer,
    )

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={styles.container}>
        <LinearGradient colors={["#E8EAF6", "#F3E5F5", "#FCE4EC"]} style={styles.backgroundGradient}>
          {/* Animated Background Bubbles */}
          <Animated.View
            style={[
              styles.bubble,
              styles.bubbleTop,
              {
                opacity: bubbleAnim1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.05, 0.15],
                }),
                transform: [
                  {
                    scale: bubbleAnim1.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.2],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.bubble,
              styles.bubbleBottom,
              {
                opacity: bubbleAnim2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.05, 0.1],
                }),
                transform: [
                  {
                    scale: bubbleAnim2.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1.1],
                    }),
                  },
                ],
              },
            ]}
          />

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Profile</Text>
            {/* Removed 3-dots/menu button */}
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {renderProfileHeader()}
              {renderTipsSection()}
              {renderSettingsSection()}
              {renderLogoutButton()}

              <View style={styles.bottomSpacing} />
            </Animated.View>
          </ScrollView>
        </LinearGradient>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
  },
  bubble: {
    position: "absolute",
    borderRadius: 100,
    backgroundColor: "rgba(156, 39, 176, 0.1)",
  },
  bubbleTop: {
    width: 200,
    height: 200,
    top: -50,
    right: -50,
  },
  bubbleBottom: {
    width: 150,
    height: 150,
    bottom: 100,
    left: -75,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 50,
    paddingBottom: 10,
    backgroundColor: "rgba(156, 39, 176, 0.8)",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10,
  },
  content: {
    flex: 1,
  },
  profileContainer: {
    marginBottom: 30,
    borderRadius: 25,
    shadowColor: "#9C27B0",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 20,
  },
  profileGradient: {
    borderRadius: 25,
    padding: 30,
    position: "relative",
  },
  profileImageContainer: {
    alignSelf: "center",
    marginBottom: 25,
    position: "relative",
  },
  profileImageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 12,
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  profileImagePlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
  },
  editImageButton: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FF6B9D",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
    shadowColor: "#FF6B9D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  profileInfo: {
    alignItems: "center",
    marginBottom: 25,
  },
  profileName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  profileEmail: {
    fontSize: 17,
    color: "rgba(255, 255, 255, 0.95)",
    marginBottom: 5,
    fontWeight: "500",
  },
  profilePhone: {
    fontSize: 17,
    color: "rgba(255, 255, 255, 0.95)",
    marginBottom: 20,
    fontWeight: "500",
  },
  pregnancyProgress: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  progressSubtitle: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 5,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "white",
    borderRadius: 5,
    shadowColor: "white",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    minWidth: 40,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dueDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  dueDateText: {
    fontSize: 17,
    color: "white",
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  editButton: {
    position: "absolute",
    top: 25,
    right: 25,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#9C27B0",
    marginLeft: 6,
  },
  animatedCard: {
    marginBottom: 15,
  },
  sectionContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 15,
    marginLeft: 5,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tipIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: "#7F8C8D",
    lineHeight: 20,
  },
  settingsCard: {
    backgroundColor: "white",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  lastSettingItem: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  settingText: {
    fontSize: 16,
    color: "#2C3E50",
    fontWeight: "500",
  },
  logoutContainer: {
    marginTop: 10,
  },
  logoutButton: {
    borderRadius: 15,
    shadowColor: "#FF5722",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logoutGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 15,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginLeft: 10,
  },
  bottomSpacing: {
    height: 30,
  },
})

export default ProfileScreen
