import Constants from "expo-constants"
import { useEffect, useState } from "react"
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native"

const ExerciseScreen = () => {
  const [featured, setFeatured] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchFeaturedExercise = async () => {
    const openaiKey = Constants.expoConfig?.extra?.openaiApiKey
    console.log("OpenAI Key:", openaiKey)
    if (!openaiKey) return

    const prompt = `Generate 1 safe prenatal exercise for a pregnant woman in her second trimester. Include: name, description, duration, category, and image. Return JSON.`

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
            { role: "system", content: "You are a helpful prenatal fitness assistant." },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
        }),
      })

      const data = await response.json()
      const content = data?.choices?.[0]?.message?.content
      console.log("GPT Response Content:", content)
      const parsed = JSON.parse(content)
      setFeatured(parsed)
    } catch (error) {
      console.error("Error fetching GPT exercise:", error)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchFeaturedExercise()
  }, [])

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Featured Exercise Today</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#A36AC3" />
      ) : featured ? (
        <View style={styles.card}>
          <Text style={styles.name}>{featured.name}</Text>
          <Text>{featured.description}</Text>
          <Text style={styles.meta}>{featured.duration} · {featured.category}</Text>
        </View>
      ) : (
        <Text>No featured exercise found.</Text>
      )}
    </ScrollView>
  )
}

export default ExerciseScreen

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#FFF5FC" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, color: "#4B2354" },
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 12, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5 },
  name: { fontSize: 18, fontWeight: "bold", color: "#4B2354" },
  meta: { marginTop: 8, color: "#A58DB2", fontSize: 12 },
})