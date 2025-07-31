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
  const [loadingGPT, setLoadingGPT] = useState(true)

  const fetchGPTExercises = async (trimester: string, apiKey: string) => {
    const prompt = `Generate 3 safe prenatal exercises for a woman in her ${trimester} for today (${new Date().toDateString()}). Each should include:
- name
- description
- duration (e.g. "15 mins")
- category (e.g. yoga, walk, kegel)
- a YouTube thumbnail image URL if available

Return result in JSON format like:
[
  {
    "name": "Prenatal Yoga",
    "description": "Gentle yoga for flexibility and relaxation.",
    "duration": "15 mins",
    "category": "yoga",
    "image": "https://img.youtube.com/vi/xyz/0.jpg"
  },
  ...
]`

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
      setRecommendedExercises(JSON.parse(cached))
      setLoadingGPT(false)
      return
    }

    const openaiKey = Constants.expoConfig?.extra?.openaiApiKey
    const gptData = await fetchGPTExercises(trimester, openaiKey)
    if (gptData.length > 0) {
      await AsyncStorage.setItem(todayKey, JSON.stringify(gptData))
      setRecommendedExercises(gptData)
    }

    setLoadingGPT(false)
  }

  useEffect(() => {
    loadExercises()
  }, [])

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={["#EEC8F9", "#F6D2FA"]} style={styles.header}>
        <Text style={styles.headerTitle}>Hi Mama 💜</Text>
        <Text style={styles.headerSubtitle}>
          You're in your {trimester} · Week {week}
        </Text>
      </LinearGradient>

      {/* Recommended Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommended for You</Text>
        {loadingGPT ? (
          <ActivityIndicator size="large" color="#C672E5" />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recommendedExercises.map((exercise, index) => (
              <TouchableOpacity key={index} style={styles.exerciseCard}>
                <Image
                  source={{ uri: exercise.image }}
                  style={styles.exerciseImage}
                />
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseMeta}>
                    {exercise.duration} · {exercise.category}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  )
}

export default ExerciseScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5FC",
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#4B2354",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6D4B75",
    marginTop: 4,
  },
  section: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4B2354",
    marginBottom: 12,
  },
  exerciseCard: {
    width: screenWidth * 0.6,
    marginRight: 15,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  exerciseImage: {
    height: 120,
    width: "100%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  exerciseInfo: {
    padding: 10,
  },
  exerciseName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#4B2354",
  },
  exerciseMeta: {
    fontSize: 13,
    color: "#977A9C",
    marginTop: 2,
  },
})
