"use client"

import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ImageBackground,
    Platform,
    SafeAreaView, // Changed from Image to ImageBackground
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
  youtube_url?: string
}

const categories = ["Stretching", "Cardio", "Strength", "Yoga", "Breathing"]

const Explore = () => {
  const [exerciseData, setExerciseData] = useState<{ [key: string]: Exercise[] }>({})
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchExercisesForCategory = useCallback(async (category: string) => {
    try {
      const res = await fetch(`https://pregwell-backend.onrender.com/api/exercises?category=${category}`)
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const data = await res.json()
      return data
    } catch (err) {
      console.error(`Error fetching ${category} exercises:`, err)
      Alert.alert("Error", `Failed to load ${category} exercises.`)
      return []
    }
  }, [])

  useEffect(() => {
    const loadAllCategoryData = async () => {
      setLoading(true)
      const categoryMap: { [key: string]: Exercise[] } = {}
      const fetchPromises = categories.map(async (cat) => {
        categoryMap[cat] = await fetchExercisesForCategory(cat)
      })
      await Promise.all(fetchPromises)
      setExerciseData(categoryMap)
      setLoading(false)
    }
    loadAllCategoryData()
  }, [fetchExercisesForCategory])

  const renderCard = (exercise: Exercise) => (
    <TouchableOpacity
      key={exercise.id}
      style={styles.exerciseCard}
      activeOpacity={0.8}
      onPress={() =>
        router.push({
          pathname: "/ExerciseVideo",
          params: {
            name: exercise.name,
            youtubeUrl: exercise.youtube_url,
          },
        })
      }
    >
      <ImageBackground // Changed to ImageBackground
        source={{ uri: exercise.image || "/placeholder.svg?height=160&width=400" }}
        style={styles.exerciseImage}
        resizeMode="cover" // Ensure resizeMode is set
      >
        <LinearGradient colors={["transparent", "rgba(0,0,0,0.6)"]} style={styles.imageOverlay} />
        <View style={styles.videoOverlayIcon}>
          <Ionicons name="play-circle" size={60} color="rgba(255,255,255,0.8)" />
        </View>
        <View style={styles.exerciseCategoryBadge}>
          <Ionicons name="fitness-outline" size={14} color="white" />
          <Text style={styles.exerciseCategoryText}>{exercise.category}</Text>
        </View>
      </ImageBackground>
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName} numberOfLines={1}>
          {exercise.name}
        </Text>
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
        {/* Removed the playButton */}
      </View>
    </TouchableOpacity>
  )

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
              <Text style={styles.headerTitle}>Explore Categories</Text>
              <View style={styles.headerBadge}>
                <Ionicons name="grid-outline" size={12} color="#C672E5" />
                <Text style={styles.headerBadgeText}>All Exercises</Text>
              </View>
            </View>

            {/* Placeholder for a search button or other action */}
            <TouchableOpacity style={styles.searchButton}>
              <Ionicons name="search-outline" size={22} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>Find the perfect workout for you</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.contentScrollView} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#C672E5" />
            <Text style={styles.loadingText}>Loading exercise categories...</Text>
          </View>
        ) : (
          categories.map((category) => (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.categorySectionTitle}>{category}</Text>
              {exerciseData[category] && exerciseData[category].length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScroll}
                >
                  {exerciseData[category].map((exercise) => renderCard(exercise))}
                </ScrollView>
              ) : (
                <View style={styles.emptyStateCard}>
                  <Ionicons name="sad-outline" size={40} color="#D1C4E9" />
                  <Text style={styles.emptyTitleSmall}>No {category.toLowerCase()} exercises found.</Text>
                  <Text style={styles.emptySubtitleSmall}>Check back later for new additions!</Text>
                </View>
              )}
            </View>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

export default Explore

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
  searchButton: {
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
  categorySection: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  categorySectionTitle: {
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
    width: screenWidth * 0.6, // Slightly smaller cards for horizontal scroll
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
  exerciseImage: {
    height: 120, // Smaller image height
    width: "100%",
    justifyContent: "center", // Center children vertically
    alignItems: "center", // Center children horizontally
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
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 15,
    zIndex: 2, // Ensure badge is above overlay and icon
  },
  exerciseCategoryText: {
    color: "white",
    fontSize: 10, // Smaller font for badge
    fontWeight: "600",
    marginLeft: 5,
  },
  exerciseInfo: {
    padding: 12, // Smaller padding
  },
  exerciseName: {
    fontWeight: "bold",
    fontSize: 16, // Smaller font for name
    color: "#4B2354",
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 12, // Smaller font for description
    color: "#6D4B75",
    marginBottom: 8,
    lineHeight: 16,
  },
  exerciseMetaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  exerciseMeta: {
    fontSize: 11, // Smaller font for meta
    color: "#977A9C",
    marginLeft: 4,
    marginRight: 8,
  },
  metaDivider: {
    width: 1,
    height: 12, // Smaller divider
    backgroundColor: "#E0E0E0",
    marginHorizontal: 4,
  },
  // Removed playButton and playButtonText styles
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
  // Added videoOverlayIcon style
  videoOverlayIcon: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1, // Ensure it's above the image but below the badge
  },
})
