import AsyncStorage from "@react-native-async-storage/async-storage"
import Constants from "expo-constants"
import { LinearGradient } from "expo-linear-gradient"
import React, { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

const screenWidth = Dimensions.get("window").width

const ExerciseScreen = () => {
  const [trimester, setTrimester] = useState("2nd Trimester")
  const [week, setWeek] = useState(22)
  const [recommendedExercises, setRecommendedExercises] = useState([])
  const [filteredExercises, setFilteredExercises] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [loadingGPT, setLoadingGPT] = useState(true)

  const [featuredExercise, setFeaturedExercise] = useState(null)
  const [loadingFeatured, setLoadingFeatured] = useState(true)
  const [favorites, setFavorites] = useState([])

  const fetchGPTExercises = async (trimester, apiKey) => {
    const prompt = `Generate 3 safe prenatal exercises for a woman in her ${trimester} for today (${new Date().toDateString()}). Each should include: name, description, duration, category, and image URL. Return JSON.`

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            { role: "system", content: "You are a prenatal fitness assistant." },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
        }),
      })

      const data = await response.json()
      const content = data?.choices?.[0]?.message?.content || "[]"
      return JSON.parse(content)
    } catch (error) {
      console.error("GPT fetch failed:", error)
      return []
    }
  }

  const loadExercises = async () => {
    const todayKey = `@daily_exercises_${new Date().toDateString()}`
    const cached = await AsyncStorage.getItem(todayKey)
    if (cached) {
      const data = JSON.parse(cached)
      setRecommendedExercises(data)
      setFilteredExercises(data)
      setLoadingGPT(false)
      return
    }
    const openaiKey = Constants.expoConfig?.extra?.openaiApiKey
    const gptData = await fetchGPTExercises(trimester, openaiKey)
    if (gptData.length > 0) {
      await AsyncStorage.setItem(todayKey, JSON.stringify(gptData))
      setRecommendedExercises(gptData)
      setFilteredExercises(gptData)
    }
    setLoadingGPT(false)
  }

  const loadFeaturedExercise = async () => {
    const todayKey = `@featured_exercise_${new Date().toDateString()}`
    const cached = await AsyncStorage.getItem(todayKey)
    if (cached) {
      setFeaturedExercise(JSON.parse(cached))
      setLoadingFeatured(false)
      return
    }
    const openaiKey = Constants.expoConfig?.extra?.openaiApiKey
    const prompt = `Generate 1 featured prenatal exercise for a woman in her ${trimester} for today (${new Date().toDateString()}). Return JSON with name, description, duration, category, and image.`
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            { role: "system", content: "You are a prenatal fitness assistant." },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
        }),
      })
      const data = await response.json()
      const content = data?.choices?.[0]?.message?.content || "{}"
      const featured = JSON.parse(content)
      setFeaturedExercise(featured)
      await AsyncStorage.setItem(todayKey, JSON.stringify(featured))
    } catch (err) {
      console.error("Featured GPT error:", err)
    }
    setLoadingFeatured(false)
  }

  const toggleFavorite = async (exercise) => {
    const updated = favorites.find((e) => e.name === exercise.name)
      ? favorites.filter((e) => e.name !== exercise.name)
      : [...favorites, exercise]
    setFavorites(updated)
    await AsyncStorage.setItem("@saved_workouts", JSON.stringify(updated))
  }

  const filterByCategory = (cat) => {
    if (cat === selectedCategory) {
      setFilteredExercises(recommendedExercises)
      setSelectedCategory(null)
    } else {
      setFilteredExercises(recommendedExercises.filter((e) => e.category === cat))
      setSelectedCategory(cat)
    }
  }

  useEffect(() => {
    console.log("OpenAI Key:", Constants.expoConfig?.extra?.openaiApiKey)
    loadExercises()
    loadFeaturedExercise()
    AsyncStorage.getItem("@saved_workouts").then((val) => {
      if (val) setFavorites(JSON.parse(val))
    })
  }, [])

  const categories = Array.from(
    new Set(recommendedExercises.map((e) => e.category))
  )

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={["#EEC8F9", "#F6D2FA"]} style={styles.header}>
        <Text style={styles.headerTitle}>Hi Mama 💜</Text>
        <Text style={styles.headerSubtitle}>
          You're in your {trimester} · Week {week}
        </Text>
      </LinearGradient>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Today</Text>
        {loadingFeatured ? (
          <ActivityIndicator size="large" color="#D98DF5" />
        ) : featuredExercise ? (
          <TouchableOpacity style={styles.featuredCard}>
            <Image source={{ uri: featuredExercise.image }} style={styles.featuredImage} />
            <View style={styles.featuredTextContainer}>
              <Text style={styles.featuredTitle}>{featuredExercise.name}</Text>
              <Text style={styles.featuredDesc}>{featuredExercise.description}</Text>
              <Text style={styles.featuredMeta}>{featuredExercise.duration} · {featuredExercise.category}</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <Text>No featured exercise today.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Explore by Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((cat, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.categoryChip, selectedCategory === cat && styles.activeChip]}
              onPress={() => filterByCategory(cat)}>
              <Text style={styles.chipText}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommended for You</Text>
        {loadingGPT ? (
          <ActivityIndicator size="large" color="#C672E5" />
        ) : (
          filteredExercises.map((exercise, index) => (
            <TouchableOpacity key={index} style={styles.exerciseCard}>
              <Image source={{ uri: exercise.image }} style={styles.exerciseImage} />
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseMeta}>{exercise.duration} · {exercise.category}</Text>
                <TouchableOpacity onPress={() => toggleFavorite(exercise)}>
                  <Text style={{ fontSize: 12, color: "#A37DC4" }}>
                    {favorites.find((f) => f.name === exercise.name) ? "💜 Saved" : "🤍 Save"}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Saved Workouts</Text>
        {favorites.length === 0 ? (
          <Text style={{ color: "#BCA8C8", fontStyle: "italic" }}>No saved workouts yet.</Text>
        ) : (
          favorites.map((fav, index) => (
            <TouchableOpacity key={index} style={styles.exerciseCard}>
              <Image source={{ uri: fav.image }} style={styles.exerciseImage} />
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{fav.name}</Text>
                <Text style={styles.exerciseMeta}>{fav.duration} · {fav.category}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  )
}

export default ExerciseScreen

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF5FC" },
  header: { padding: 20, paddingTop: 60, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTitle: { fontSize: 26, fontWeight: "bold", color: "#4B2354" },
  headerSubtitle: { fontSize: 16, color: "#6D4B75", marginTop: 4 },
  section: { marginTop: 25, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#4B2354", marginBottom: 12 },
  featuredCard: { borderRadius: 16, overflow: "hidden", backgroundColor: "#fff", elevation: 3, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6 },
  featuredImage: { height: 160, width: "100%" },
  featuredTextContainer: { padding: 10 },
  featuredTitle: { fontWeight: "bold", fontSize: 16, color: "#4B2354" },
  featuredDesc: { fontSize: 13, color: "#6D4B75", marginTop: 4 },
  featuredMeta: { fontSize: 12, color: "#A58DB2", marginTop: 4 },
  exerciseCard: { width: "100%", marginBottom: 15, borderRadius: 16, backgroundColor: "#FFFFFF", shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 3 },
  exerciseImage: { height: 120, width: "100%", borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  exerciseInfo: { padding: 10 },
  exerciseName: { fontWeight: "bold", fontSize: 16, color: "#4B2354" },
  exerciseMeta: { fontSize: 13, color: "#977A9C", marginTop: 2 },
  categoryChip: { backgroundColor: "#EAD6F9", paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, marginRight: 10 },
  chipText: { color: "#4B2354", fontSize: 13 },
  activeChip: { backgroundColor: "#C68FE5" },
})
