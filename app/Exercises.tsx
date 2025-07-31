import AsyncStorage from "@react-native-async-storage/async-storage"
import React, { useEffect, useState } from "react"
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from "react-native"

const ExerciseScreen = () => {
  const [featured, setFeatured] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchDailyExercise = async () => {
    setLoading(true)

    try {
      const userId = await AsyncStorage.getItem("userId")
      if (!userId) {
        console.warn("No user ID found")
        return
      }

      const res = await fetch(`https://pregwell-backend.onrender.com/api/exercises/daily/${userId}`)
      const data = await res.json()

      if (res.ok) {
        setFeatured(data)
      } else {
        console.error("❌ Fetch failed:", data?.error)
      }
    } catch (err) {
      console.error("🔥 Error fetching daily exercise:", err)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchDailyExercise()
  }, [])

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Featured Exercise Today</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#A36AC3" />
      ) : featured ? (
        <View style={styles.card}>
          <Text style={styles.name}>{featured.name}</Text>
          {featured.image && (
            <Image source={{ uri: featured.image }} style={styles.image} resizeMode="cover" />
          )}
          <Text style={styles.description}>{featured.description}</Text>
          <Text style={styles.meta}>
            {featured.duration} · {featured.category}
          </Text>
        </View>
      ) : (
        <Text>No featured exercise found.</Text>
      )}
    </ScrollView>
  )
}

export default ExerciseScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFF5FC",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#4B2354",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4B2354",
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    color: "#555",
  },
  meta: {
    marginTop: 10,
    fontSize: 12,
    color: "#A58DB2",
  },
  image: {
    height: 200,
    width: "100%",
    borderRadius: 12,
    marginTop: 12,
  },
})
