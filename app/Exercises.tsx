import AsyncStorage from "@react-native-async-storage/async-storage"
import React, { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"

const ExerciseScreen = () => {
  const [featured, setFeatured] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchFeaturedExercise = async () => {
    setLoading(true)
    try {
      const userId = await AsyncStorage.getItem("userId")
      if (!userId) throw new Error("No user ID found")

      const response = await fetch(`https://pregwell-backend.onrender.com/api/exercises/daily/${userId}`)
      const data = await response.json()

      if (response.ok) {
        setFeatured(data)
      } else {
        console.error("Exercise fetch error:", data.error)
      }
    } catch (err) {
      console.error("Failed to fetch daily exercise:", err)
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
          {featured.image && (
            <Image source={{ uri: featured.image }} style={styles.image} />
          )}
          <Text style={styles.name}>{featured.name}</Text>
          <Text style={styles.description}>{featured.description}</Text>
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
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    color: "#4B2354",
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    color: "#555",
  },
  meta: {
    marginTop: 10,
    color: "#A58DB2",
    fontSize: 12,
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    resizeMode: "cover",
  },
})
