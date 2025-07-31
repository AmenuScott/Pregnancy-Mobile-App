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

const { width } = Dimensions.get("window")
const statusBarHeight = Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 24

interface Food {
  name: string
  category: string
  benefit: string
}

interface Meal {
  title: string
  type: string
  image_url?: string
  items: string[]
  instructions: string
}

interface AvoidItem {
  name: string
  reason: string
}

interface NutritionTip {
  tip: string
}

const DietScreen = () => {
  const [userId, setUserId] = useState<string | null>(null)
  const [trimester, setTrimester] = useState(1)
  const [foods, setFoods] = useState<Food[]>([])
  const [meals, setMeals] = useState<Meal[]>([])
  const [avoid, setAvoid] = useState<AvoidItem[]>([])
  const [tips, setTips] = useState<NutritionTip[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update time every minute for greeting

    return () => clearInterval(timer)
  }, [])

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 17) return "Good Afternoon"
    return "Good Evening"
  }

  const fetchAllData = useCallback(async () => {
    setLoading(true)
    try {
      const id = await AsyncStorage.getItem("userId")
      setUserId(id)

      if (!id) {
        Alert.alert("Error", "User ID not found. Please log in again.")
        setLoading(false)
        return
      }

      const profileRes = await fetch(`https://pregwell-backend.onrender.com/api/patients/${id}`)
      if (!profileRes.ok) {
        throw new Error(`Failed to fetch profile: ${profileRes.status}`)
      }
      const profile = await profileRes.json()
      setTrimester(profile.trimester || 1)

      const [fRes, mRes, aRes, tRes] = await Promise.all([
        fetch(`https://pregwell-backend.onrender.com/api/recommended-foods/${profile.trimester}`),
        fetch(`https://pregwell-backend.onrender.com/api/meal-ideas/${profile.trimester}`),
        fetch("https://pregwell-backend.onrender.com/api/foods-to-avoid"),
        fetch("https://pregwell-backend.onrender.com/api/nutrition-tips"),
      ])

      const fData = await fRes.json()
      const mData = await mRes.json()
      const aData = await aRes.json()
      const tData = await tRes.json()

      setFoods(fData)
      setMeals(mData)
      setAvoid(aData)
      setTips(tData)
    } catch (err: any) {
      console.error("Error fetching diet data:", err)
      Alert.alert("Error", `Failed to load diet data: ${err.message || "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#A36AC3" />
        <LinearGradient colors={["#A36AC3", "#C672E5"]} style={styles.loadingGradient}>
          <View style={styles.loadingContent}>
            <View style={styles.loadingSpinner}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
            <Text style={styles.loadingText}>Loading your personalized diet plan...</Text>
          </View>
        </LinearGradient>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#A36AC3" />

      {/* Modern Header with Gradient */}
      <LinearGradient colors={["#A36AC3", "#C672E5"]} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>{getGreeting()}</Text>
              <View style={styles.headerBadge}>
                <Ionicons name="nutrition-outline" size={12} color="#A36AC3" />
                <Text style={styles.headerBadgeText}>Trimester {trimester}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.refreshButton} onPress={fetchAllData}>
              <Ionicons name="refresh-outline" size={22} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>Your personalized nutrition guide</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.contentScrollView} showsVerticalScrollIndicator={false}>
        {/* Recommended Foods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#4CAF50" /> Recommended Foods
          </Text>
          <Text style={styles.sectionSubtitle}>Nutrient-rich foods for a healthy pregnancy</Text>
          {foods.length > 0 ? (
            foods.map((food, index) => (
              <View key={index} style={styles.card}>
                <View style={styles.cardIconContainer}>
                  <Ionicons name="leaf-outline" size={24} color="#4CAF50" />
                </View>
                <View style={styles.cardTextContent}>
                  <Text style={styles.cardTitle}>{food.name}</Text>
                  <Text style={styles.cardSubtitle}>{food.category}</Text>
                  <Text style={styles.cardDesc}>{food.benefit}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyStateCard}>
              <Ionicons name="sad-outline" size={40} color="#D1C4E9" />
              <Text style={styles.emptyTitleSmall}>No recommended foods found.</Text>
              <Text style={styles.emptySubtitleSmall}>Check back later for updates!</Text>
            </View>
          )}
        </View>

        {/* Meal Ideas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="restaurant-outline" size={20} color="#FF9800" /> Meal Ideas
          </Text>
          <Text style={styles.sectionSubtitle}>Delicious and easy recipes for your trimester</Text>
          {meals.length > 0 ? (
            meals.map((meal, index) => (
              <View key={index} style={styles.mealCard}>
                {meal.image_url && (
                  <Image
                    source={{ uri: meal.image_url || "/placeholder.svg?height=160&width=400" }}
                    style={styles.mealImage}
                  />
                )}
                <View style={styles.mealContent}>
                  <Text style={styles.mealTitle}>{meal.title}</Text>
                  <Text style={styles.mealType}>{meal.type}</Text>
                  <Text style={styles.mealIngredients}>
                    <Text style={{ fontWeight: "bold" }}>Ingredients:</Text> {meal.items.join(", ")}
                  </Text>
                  <Text style={styles.mealInstructions}>
                    <Text style={{ fontWeight: "bold" }}>Instructions:</Text> {meal.instructions}
                  </Text>
                  <TouchableOpacity style={styles.viewRecipeButton}>
                    <Ionicons name="book-outline" size={16} color="#C672E5" />
                    <Text style={styles.viewRecipeButtonText}>View Full Recipe</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyStateCard}>
              <Ionicons name="sad-outline" size={40} color="#D1C4E9" />
              <Text style={styles.emptyTitleSmall}>No meal ideas found.</Text>
              <Text style={styles.emptySubtitleSmall}>Check back later for new recipes!</Text>
            </View>
          )}
        </View>

        {/* Foods to Avoid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="warning-outline" size={20} color="#EF4444" /> Foods to Avoid
          </Text>
          <Text style={styles.sectionSubtitle}>Important foods to limit or avoid during pregnancy</Text>
          {avoid.length > 0 ? (
            avoid.map((item, index) => (
              <View key={index} style={styles.avoidCard}>
                <View style={styles.avoidIconContainer}>
                  <Ionicons name="close-circle-outline" size={24} color="#EF4444" />
                </View>
                <View style={styles.avoidTextContent}>
                  <Text style={styles.avoidTitle}>{item.name}</Text>
                  <Text style={styles.avoidReason}>{item.reason}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyStateCard}>
              <Ionicons name="happy-outline" size={40} color="#D1C4E9" />
              <Text style={styles.emptyTitleSmall}>No specific foods to avoid listed.</Text>
              <Text style={styles.emptySubtitleSmall}>Always consult your doctor for personalized advice.</Text>
            </View>
          )}
        </View>

        {/* Nutrition Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="bulb-outline" size={20} color="#2196F3" /> Nutrition Tips
          </Text>
          <Text style={styles.sectionSubtitle}>Helpful advice for a balanced diet</Text>
          {tips.length > 0 ? (
            tips.map((tip, index) => (
              <View key={index} style={styles.tipCard}>
                <Ionicons name="star-outline" size={18} color="#2196F3" style={styles.tipBulletIcon} />
                <Text style={styles.tipText}>{tip.tip}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyStateCard}>
              <Ionicons name="sad-outline" size={40} color="#D1C4E9" />
              <Text style={styles.emptyTitleSmall}>No nutrition tips found.</Text>
              <Text style={styles.emptySubtitleSmall}>Stay tuned for more helpful advice!</Text>
            </View>
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

export default DietScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDF7FF", // Light purple background
  },
  safeArea: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
  },
  loadingSpinner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
    color: "#A36AC3",
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
    marginBottom: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6D4B75",
    marginBottom: 15,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F5E9", // Light green for recommended foods
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  cardTextContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4B2354",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    fontStyle: "italic",
    color: "#977A9C",
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 14,
    color: "#6D4B75",
    lineHeight: 20,
  },
  mealCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  mealImage: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  mealContent: {
    padding: 15,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4B2354",
    marginBottom: 5,
  },
  mealType: {
    fontSize: 14,
    color: "#FF9800",
    fontWeight: "600",
    marginBottom: 8,
  },
  mealIngredients: {
    fontSize: 14,
    color: "#6D4B75",
    marginBottom: 8,
    lineHeight: 20,
  },
  mealInstructions: {
    fontSize: 14,
    color: "#6D4B75",
    lineHeight: 20,
    marginBottom: 15,
  },
  viewRecipeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3E5F5",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#C672E5",
  },
  viewRecipeButtonText: {
    color: "#C672E5",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  avoidCard: {
    backgroundColor: "#FFEBEE", // Light red for foods to avoid
    borderRadius: 16,
    marginBottom: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  avoidIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFCDD2", // Slightly darker red for icon background
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avoidTextContent: {
    flex: 1,
  },
  avoidTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#D32F2F", // Darker red for title
    marginBottom: 4,
  },
  avoidReason: {
    fontSize: 14,
    color: "#EF4444", // Red for reason
    lineHeight: 20,
  },
  tipCard: {
    backgroundColor: "#E3F2FD", // Light blue for tips
    borderRadius: 12,
    marginBottom: 10,
    padding: 15,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  tipBulletIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: "#2196F3", // Blue for tip text
    lineHeight: 20,
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
})
