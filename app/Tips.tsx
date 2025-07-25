"use client"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  Linking,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

interface HealthTip {
  id: number
  title: string
  image: string
  link: string
  source: string
}

const HealthTips = () => {
  const [tips, setTips] = useState<HealthTip[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [userName, setUserName] = useState("Mama")
  const router = useRouter()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId")
        if (!userId) throw new Error("User ID not found")
        const res = await fetch(`https://pregwell-backend.onrender.com/api/${userId}`)
        const data = await res.json()
        setUserName(data.first_name || "Mama")
      } catch (err) {
        console.error("User fetch error:", err.message)
      }
    }

    const fetchTips = async () => {
      try {
        // Try to fetch scraped tips first
        const scrapedRes = await fetch("https://pregwell-backend.onrender.com/api/scrape-tips")

        if (scrapedRes.ok) {
          const scrapedData = await scrapedRes.json()
          if (scrapedData.success && scrapedData.tips.length > 0) {
            setTips(scrapedData.tips)
            return
          }
        }

        // Fallback to original tips API
        const res = await fetch("https://pregwell-backend.onrender.com/api/tips")
        const data = await res.json()
        setTips(data.tips || [])
      } catch (err) {
        console.error("Tips fetch error:", err.message)

        // Set default tips if everything fails
        setTips([
          {
            id: 1,
            title: "Stay Hydrated During Pregnancy",
            image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=180&fit=crop&q=80",
            link: "https://www.healthline.com/health/pregnancy/how-much-water-to-drink",
            source: "healthline.com",
          },
          {
            id: 2,
            title: "Essential Prenatal Vitamins Guide",
            image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=180&fit=crop&q=80",
            link: "https://www.babycenter.com/pregnancy/diet-and-fitness/prenatal-vitamins",
            source: "babycenter.com",
          },
          {
            id: 3,
            title: "Safe Pregnancy Exercises",
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=180&fit=crop&q=80",
            link: "https://www.whattoexpect.com/pregnancy/fitness-and-exercise/",
            source: "whattoexpect.com",
          },
        ])
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    }

    fetchUserData()
    fetchTips()
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      const scrapedRes = await fetch("https://pregwell-backend.onrender.com/api/scrape-tips")
      if (scrapedRes.ok) {
        const scrapedData = await scrapedRes.json()
        if (scrapedData.success && scrapedData.tips.length > 0) {
          setTips(scrapedData.tips)
          Alert.alert("Success", "Fresh health tips loaded!")
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to refresh tips. Please try again.")
    } finally {
      setRefreshing(false)
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A93E8B" />
        <Text style={styles.loadingText}>Loading fresh health tips...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Gradient Header */}
      <LinearGradient colors={["#C67EBF", "#A93E8B"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, paddingLeft: 10 }}>
          <Text style={styles.greeting}>Hi {userName},</Text>
          <Text style={styles.subtitle}>Fresh health tips from trusted sources 💡</Text>
        </View>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={20} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Tips List */}
      <FlatList
        data={tips}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#A93E8B"]} tintColor="#A93E8B" />
        }
        renderItem={({ item }) => (
          <Animated.View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.cardContent}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.source}>Source: {item.source}</Text>
              <TouchableOpacity style={styles.readMoreButton} onPress={() => Linking.openURL(item.link)}>
                <Text style={styles.readMoreText}>Read Full Article</Text>
                <Ionicons name="open-outline" size={16} color="#A93E8B" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      />
    </SafeAreaView>
  )
}

export default HealthTips

// Enhanced styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF0F5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF0F5",
  },
  loadingText: {
    marginTop: 10,
    color: "#A93E8B",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  refreshButton: {
    padding: 8,
  },
  greeting: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#FFE6F2",
    fontSize: 14,
    marginTop: 2,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  cardContent: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  source: {
    fontSize: 12,
    color: "#666",
    marginBottom: 12,
    fontStyle: "italic",
  },
  readMoreButton: {
    backgroundColor: "#FFDDEE",
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  readMoreText: {
    color: "#A93E8B",
    fontWeight: "600",
    marginRight: 8,
  },
})
