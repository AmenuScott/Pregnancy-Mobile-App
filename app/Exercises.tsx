"use client"

import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

const screenWidth = Dimensions.get("window").width
const statusBarHeight = Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 24

interface Exercise {
  id: string
  name: string
  description: string
  duration: string
  category: string
  image: string
  is_favorite?: boolean
}

const ExerciseScreen = () => {
  const [dailyExercise, setDailyExercise] = useState<Exercise | null>(null)
  const [favorites, setFavorites] = useState<Exercise[]>([])
  const [categoryExercises, setCategoryExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const getUserId = async () => {
      const id = await AsyncStorage.getItem("userId")
      setUserId(id)
    }
    getUserId()
  }, [])

  const fetchDailyExercise = useCallback(async (currentUserId: string) => {
    try {
      const res = await fetch(`https://pregwell-backend.onrender.com/api/exercises/daily/${currentUserId}`)
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const data = await res.json()
      setDailyExercise(data)
    } catch (err) {
      console.error("Daily exercise fetch error:", err)
      Alert.alert("Error", "Failed to load daily exercise.")
      setDailyExercise(null)
    }
  }, [])

  const fetchFavorites = useCallback(async (currentUserId: string) => {
    try {
      const res = await fetch(`https://pregwell-backend.onrender.com/api/exercises/favorites/${currentUserId}`)
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const data = await res.json()
      setFavorites(data)
    } catch (err) {
      console.error("Favorites fetch error:", err)
      Alert.alert("Error", "Failed to load favorite exercises.")
      setFavorites([])
    }
  }, [])

  const fetchByCategory = useCallback(async (category: string) => {
    try {
      const res = await fetch(`https://pregwell-backend.onrender.com/api/exercises?category=${category}`)
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const data = await res.json()
      setCategoryExercises(data)
    } catch (err) {
      console.error("Category fetch error:", err)
      Alert.alert("Error", `Failed to load ${category} exercises.`)
      setCategoryExercises([])
    }
  }, [])

  useEffect(() => {
    const loadAllData = async () => {
      if (userId) {
        setLoading(true)
        await Promise.all([fetchDailyExercise(userId), fetchFavorites(userId), fetchByCategory("Stretching")])
        setLoading(false)
      }
    }
    loadAllData()
  }, [userId, fetchDailyExercise, fetchFavorites, fetchByCategory])

  const renderCard = (exercise: Exercise, isDaily = false) => (
    <TouchableOpacity
      key={exercise.id}
      style={[styles.exerciseCard, isDaily && styles.dailyExerciseCard]}
      activeOpacity={0.8}
      onPress={() => Alert.alert("Play", `Starting ${exercise.name}!`)}
    >
      <Image source={{ uri: exercise.image || "/placeholder.svg?height=160&width=400" }} style={styles.exerciseImage} />
      <LinearGradient colors={["transparent", "rgba(0,0,0,0.6)"]} style={styles.imageOverlay} />
      <View style={styles.exerciseCategoryBadge}>
        <Ionicons name="fitness-outline" size={14} color="white" />
        <Text style={styles.exerciseCategoryText}>{exercise.category}</Text>
      </View>
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <Text style={styles.exerciseDescription} numberOfLines={2}>
          {exercise.description}
        </Text>
        <View style={styles.exerciseMetaContainer}>
          <Ionicons name="time-outline" size={16} color="#977A9C" />
          <Text style={styles.exerciseMeta}>{exercise.duration}</Text>
          <View style={styles.metaDivider} />
          <Ionicons name="barbell-outline" size={16} color="#977A9C" />
          <Text style={styles.exerciseMeta}>{exercise.category}</Text>
        </View>
        <TouchableOpacity style={styles.playButton} onPress={() => Alert.alert("Play", `Starting ${exercise.name}!`)}>
          <Ionicons name="play-circle" size={30} color="#C672E5" />
          <Text style={styles.playButtonText}>Start Workout</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )

  const handleRefreshAll = async () => {
    if (userId) {
      setLoading(true)
      await Promise.all([fetchDailyExercise(userId), fetchFavorites(userId), fetchByCategory("Stretching")])
      setLoading(false)
    } else {
      Alert.alert("Error", "User not logged in. Cannot refresh data.")
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#C672E5" />
      <LinearGradient colors={["#C672E5", "#9B4DCC"]} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Hi Mama 💜</Text>
              <View style={styles.headerBadge}>
                <Ionicons name="calendar-outline" size={12} color="#C672E5" />
                <Text style={styles.headerBadgeText}>Daily Plan</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.refreshButton} onPress={handleRefreshAll}>
              <Ionicons name="refresh-outline" size={22} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>You're in your 2nd Trimester · Week 22</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.contentScrollView} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#C672E5" />
            <Text style={styles.loadingText}>Loading your personalized exercises...</Text>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Featured Today</Text>
              {dailyExercise ? (
                renderCard(dailyExercise, true)
              ) : (
                <View style={styles.emptyStateCard}>
                  <Ionicons name="sad-outline" size={40} color="#D1C4E9" />
                  <Text style={styles.emptyTitleSmall}>No daily exercise found.</Text>
                  <Text style={styles.emptySubtitleSmall}>Check back tomorrow!</Text>
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Favorites</Text>
              {favorites.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScroll}
                >
                  {favorites.map((exercise) => renderCard(exercise))}
                </ScrollView>
              ) : (
                <View style={styles.emptyStateCard}>
                  <Ionicons name="heart-outline" size={40} color="#D1C4E9" />
                  <Text style={styles.emptyTitleSmall}>No favorites yet.</Text>
                  <Text style={styles.emptySubtitleSmall}>Like an exercise to add it here!</Text>
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Explore: Stretching</Text>
              {categoryExercises.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScroll}
                >
                  {categoryExercises.map((exercise) => renderCard(exercise))}
                </ScrollView>
              ) : (
                <View style={styles.emptyStateCard}>
                  <Ionicons name="body-outline" size={40} color="#D1C4E9" />
                  <Text style={styles.emptyTitleSmall}>No stretching exercises found.</Text>
                  <Text style={styles.emptySubtitleSmall}>Try another category!</Text>
                </View>
              )}
            </View>

            <TouchableOpacity onPress={() => router.push("/explore")} style={styles.exploreMoreButton}>
              <LinearGradient colors={["#C672E5", "#9B4DCC"]} style={styles.exploreMoreButtonGradient}>
                <Ionicons name="grid-outline" size={20} color="white" />
                <Text style={styles.exploreMoreButtonText}>Explore More Categories</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

export default ExerciseScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDF7FF",
  },
  safeArea: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    padding: 20,
    paddingTop: statusBarHeight + 10,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
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
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
  },
  headerBadgeText: {
    fontSize: 12,
    color: "#C672E5",
    fontWeight: "600",
    marginLeft: 5,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 5,
    textAlign: "center",
  },
  contentScrollView: {
    flex: 1,
    paddingTop: 10,
  },
  section: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4B2354",
    marginBottom: 15,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#C672E5",
    fontWeight: "500",
  },
  horizontalScroll: {
    paddingBottom: 10,
  },
  exerciseCard: {
    width: screenWidth * 0.75,
    marginRight: 18,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  dailyExerciseCard: {
    width: "100%",
    marginRight: 0,
    marginBottom: 10,
  },
  exerciseImage: {
    height: 160,
    width: "100%",
    resizeMode: "cover",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  exerciseCategoryBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  exerciseCategoryText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 5,
  },
  exerciseInfo: {
    padding: 15,
  },
  exerciseName: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#4B2354",
    marginBottom: 5,
  },
  exerciseDescription: {
    fontSize: 13,
    color: "#6D4B75",
    marginBottom: 10,
    lineHeight: 18,
  },
  exerciseMetaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  exerciseMeta: {
    fontSize: 13,
    color: "#977A9C",
    marginLeft: 5,
    marginRight: 10,
  },
  metaDivider: {
    width: 1,
    height: 15,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 5,
  },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3E5F5",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#C672E5",
  },
  playButtonText: {
    color: "#C672E5",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  emptyStateCard: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    minHeight: 150,
  },
  emptyTitleSmall: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4B2354",
    marginTop: 10,
    marginBottom: 5,
    textAlign: "center",
  },
  emptySubtitleSmall: {
    fontSize: 13,
    color: "#6D4B75",
    textAlign: "center",
    lineHeight: 18,
  },
  exploreMoreButton: {
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 20,
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#C672E5",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  exploreMoreButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 25,
  },
  exploreMoreButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
})
