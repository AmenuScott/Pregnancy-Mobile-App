"use client"

import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useEffect, useRef } from "react"
import { Animated, Dimensions, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native"

const { width, height } = Dimensions.get("window")

const LandingScreen = () => {
  const router = useRouter()
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current

  useEffect(() => {
    checkAuthStatus()

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("token")
      const profileCompleted = await AsyncStorage.getItem("profileCompleted")
      const userId = await AsyncStorage.getItem("userId")
      const isProfileCompleted = profileCompleted === "true"

      if (!token) {
        router.replace("/login")
        return
      }

      const response = await fetch("https://pregwell-backend.onrender.com/api/patients/verify", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      })

      if (!response.ok) {
        await AsyncStorage.removeItem("token")
        await AsyncStorage.removeItem("profileCompleted")
        await AsyncStorage.removeItem("userId")
        router.replace("/login")
        return
      }

      if (isProfileCompleted) {
        router.replace("/Home")
      } else {
        router.replace(`/setup?userId=${userId}`)
      }

    } catch (error) {
      console.error("Auth check error:", error)
      router.replace("/login")
    }
  }

  const handleContinue = () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true }).start(() =>
      router.replace("/login"),
    )
  }

  const handleRefresh = () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => router.replace("/"))
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient colors={["#FF4FC3", "#F72FDB", "#E91E63"]} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <View style={styles.header}>
              <LinearGradient colors={["rgba(255,255,255,0.9)", "rgba(255,255,255,0.7)"]} style={styles.logo}>
                <Text style={styles.title}>PregWell</Text>
                <Ionicons name="heart" size={20} color="#E91E63" />
              </LinearGradient>
              <Text style={styles.welcomeBackText}>Welcome Back! 👋🏾</Text>
              <Text style={styles.welcomeSubtext}>Ready to continue your pregnancy journey?</Text>
            </View>

            <View style={styles.imageContainer}>
              <View style={styles.imageWrapper}>
                <View style={styles.pregnancyIcon}>
                  <Text style={styles.pregnancyEmoji}>🤱🏾</Text>
                </View>
                <View style={styles.imageRing}></View>
              </View>
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.appName}>PregWell App</Text>
              <Text style={styles.description}>Your trusted Pregnancy & Wellness companion.</Text>
              <View style={styles.versionContainer}>
                <Ionicons name="checkmark-circle" size={16} color="rgba(0, 238, 8, 0.8)" />
                <Text style={styles.version}>Version 1.0 • Verified</Text>
              </View>
              <View style={styles.quickStats}>
                {[{ icon: "people", text: "1000+ Mothers" }, { icon: "star", text: "4.9 Rating" }, { icon: "shield-checkmark", text: "Secure" }].map((stat, i) => (
                  <View key={i} style={styles.statItem}>
                    <Ionicons name={stat.icon as any} size={18} color="white" />
                    <Text style={styles.statText}>{stat.text}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
                <LinearGradient
                  colors={["rgba(255,255,255,0.9)", "rgba(255,255,255,0.8)"]}
                  style={styles.continueButtonGradient}
                >
                  <Ionicons name="arrow-forward" size={20} color="#E91E63" />
                  <Text style={styles.continueButtonText}>Continue to App</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.onboardingButton} onPress={handleRefresh}>
                <View style={styles.onboardingButtonContent}>
                  <Ionicons name="refresh" size={18} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.onboardingButtonText}>Refresh</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Made with ❤️ for Ghanaian mothers</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    marginTop: 20,
  },
  logo: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 30,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#E91E63",
    marginRight: 10,
  },
  welcomeBackText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  pregnancyIcon: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
    zIndex: 2,
  },
  pregnancyEmoji: {
    fontSize: 60,
  },
  imageRing: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderStyle: "dashed",
  },
  infoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  appName: {
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginBottom: 10,
  },
  versionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  version: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginLeft: 5,
  },
  quickStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statText: {
    fontSize: 12,
    color: "white",
    marginTop: 4,
    fontWeight: "500",
  },
  buttonContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  continueButton: {
    width: "100%",
    borderRadius: 25,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  continueButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 25,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E91E63",
    marginLeft: 10,
  },
  onboardingButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  onboardingButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 25,
  },
  onboardingButtonText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginLeft: 8,
    fontWeight: "500",
  },
  footer: {
    alignItems: "center",
    marginBottom: 10,
  },
  footerText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    fontStyle: "italic",
    textAlign: "center",
  },
})

export default LandingScreen
