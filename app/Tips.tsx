"use client"

import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
  Platform,
  RefreshControl,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

const { width, height } = Dimensions.get("window")
const statusBarHeight = Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 24

interface HealthTip {
  id: number
  title: string
  image: string
  link: string
  source: string
  likes?: number
  comments?: number
  isLiked?: boolean
}

const HealthTips = () => {
  const [tips, setTips] = useState<HealthTip[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [userName, setUserName] = useState("Mama")
  const [showOptionsModal, setShowOptionsModal] = useState(false)
  const [selectedTip, setSelectedTip] = useState<HealthTip | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId")
        if (!userId) throw new Error("User ID not found")

        const res = await fetch(`https://pregwell-backend.onrender.com/api/${userId}`)
        const contentType = res.headers.get("content-type")

        if (!contentType || !contentType.includes("application/json")) {
          console.warn("Response is not JSON, using default name")
          return
        }

        const data = await res.json()
        setUserName(data.first_name || "Mama")
      } catch (err) {
        console.error("User fetch error:", err.message)
        // Use default name on error
      }
    }

    const fetchTips = async () => {
      try {
        // Try to fetch scraped tips first
        const scrapedRes = await fetch("https://pregwell-backend.onrender.com/api/scrape-tips")
        if (scrapedRes.ok) {
          const contentType = scrapedRes.headers.get("content-type")
          if (contentType && contentType.includes("application/json")) {
            const scrapedData = await scrapedRes.json()
            if (scrapedData.success && scrapedData.tips.length > 0) {
              const tipsWithSocialData = scrapedData.tips.map((tip: HealthTip) => ({
                ...tip,
                likes: Math.floor(Math.random() * 50) + 10,
                comments: Math.floor(Math.random() * 20) + 3,
                isLiked: false,
              }))
              setTips(tipsWithSocialData)
              return
            }
          }
        }

        // Fallback to original tips API
        const res = await fetch("https://pregwell-backend.onrender.com/api/tips")
        const contentType = res.headers.get("content-type")

        if (contentType && contentType.includes("application/json")) {
          const data = await res.json()
          const tipsWithSocialData = (data.tips || []).map((tip: HealthTip) => ({
            ...tip,
            likes: Math.floor(Math.random() * 50) + 10,
            comments: Math.floor(Math.random() * 20) + 3,
            isLiked: false,
          }))
          setTips(tipsWithSocialData)
        } else {
          throw new Error("Invalid response format")
        }
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
            likes: 42,
            comments: 12,
            isLiked: false,
          },
          {
            id: 2,
            title: "Essential Prenatal Vitamins Guide",
            image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=180&fit=crop&q=80",
            link: "https://www.babycenter.com/pregnancy/diet-and-fitness/prenatal-vitamins",
            source: "babycenter.com",
            likes: 38,
            comments: 8,
            isLiked: false,
          },
          {
            id: 3,
            title: "Safe Pregnancy Exercises",
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=180&fit=crop&q=80",
            link: "https://www.whattoexpect.com/pregnancy/fitness-and-exercise/",
            source: "whattoexpect.com",
            likes: 56,
            comments: 15,
            isLiked: false,
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
        const contentType = scrapedRes.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const scrapedData = await scrapedRes.json()
          if (scrapedData.success && scrapedData.tips.length > 0) {
            const tipsWithSocialData = scrapedData.tips.map((tip: HealthTip) => ({
              ...tip,
              likes: Math.floor(Math.random() * 50) + 10,
              comments: Math.floor(Math.random() * 20) + 3,
              isLiked: false,
            }))
            setTips(tipsWithSocialData)
            Alert.alert("Success", "Fresh health tips loaded!")
          }
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to refresh tips. Please try again.")
    } finally {
      setRefreshing(false)
    }
  }

  const handleLike = (tipId: number) => {
    setTips((prevTips) =>
      prevTips.map((tip) =>
        tip.id === tipId
          ? {
              ...tip,
              isLiked: !tip.isLiked,
              likes: tip.isLiked ? (tip.likes || 0) - 1 : (tip.likes || 0) + 1,
            }
          : tip,
      ),
    )
  }

  const handleComment = (tipId: number) => {
    setTips((prevTips) =>
      prevTips.map((tip) => (tip.id === tipId ? { ...tip, comments: (tip.comments || 0) + 1 } : tip)),
    )
    Alert.alert("Comment", "Comment feature coming soon! 💬")
  }

  const handleShare = async (tip: HealthTip) => {
    try {
      await Share.share({
        message: `Check out this health tip: ${tip.title}\n\nRead more: ${tip.link}`,
        title: tip.title,
        url: tip.link,
      })
    } catch (error) {
      console.error("Share error:", error)
    }
  }

  const showOptions = (tip: HealthTip) => {
    setSelectedTip(tip)

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Save Article", "Report Content", "Hide Post"],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 3,
        },
        (buttonIndex) => {
          handleOptionSelect(buttonIndex)
        },
      )
    } else {
      setShowOptionsModal(true)
    }
  }

  const handleOptionSelect = (index: number) => {
    setShowOptionsModal(false)

    switch (index) {
      case 1:
        Alert.alert("Saved", "Article saved to your reading list!")
        break
      case 2:
        Alert.alert("Report", "Thank you for reporting. We'll review this content.")
        break
      case 3:
        Alert.alert("Hidden", "Post hidden from your feed.")
        break
      default:
        break
    }

    setSelectedTip(null)
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#667eea" />
        <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.loadingGradient}>
          <View style={styles.loadingContent}>
            <View style={styles.loadingSpinner}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
            <Text style={styles.loadingText}>Loading wellness feed...</Text>
          </View>
        </LinearGradient>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />

      {/* Full Notch Header */}
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Wellness Feed</Text>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live Updates</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh} activeOpacity={0.7}>
            <Ionicons name="refresh" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Modern News Feed */}
      <FlatList
        data={tips}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.feedContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#667eea"]}
            tintColor="#667eea"
            progressBackgroundColor="#fff"
          />
        }
        renderItem={({ item, index }) => (
          <View style={styles.feedItem}>
            {/* Article Header */}
            <View style={styles.articleHeader}>
              <View style={styles.sourceInfo}>
                <View style={styles.sourceAvatar}>
                  <Ionicons name="medical" size={16} color="#667eea" />
                </View>
                <View style={styles.sourceDetails}>
                  <Text style={styles.sourceName}>{item.source}</Text>
                  <Text style={styles.publishTime}>2 hours ago</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.moreButton} onPress={() => showOptions(item)} activeOpacity={0.7}>
                <View style={styles.dotsContainer}>
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Article Content */}
            <Text style={styles.articleTitle}>{item.title}</Text>

            {/* Article Image */}
            <TouchableOpacity
              style={styles.imageContainer}
              onPress={() => Linking.openURL(item.link)}
              activeOpacity={0.95}
            >
              <Image
                source={{
                  uri: item.image?.startsWith("http")
                    ? item.image
                    : "https://via.placeholder.com/400x200?text=Health+Tip",
                }}
                style={styles.articleImage}
              />
              <LinearGradient colors={["transparent", "rgba(0,0,0,0.4)"]} style={styles.imageGradient} />
              <View style={styles.readBadge}>
                <Ionicons name="time-outline" size={14} color="#fff" />
                <Text style={styles.readTime}>3 min read</Text>
              </View>
            </TouchableOpacity>

            {/* Article Actions */}
            <View style={styles.articleActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => Linking.openURL(item.link)}
                activeOpacity={0.8}
              >
                <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.readButton}>
                  <Ionicons name="book-outline" size={16} color="#fff" />
                  <Text style={styles.readButtonText}>Read Article</Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.socialActions}>
                <TouchableOpacity style={styles.socialButton} onPress={() => handleLike(item.id)} activeOpacity={0.7}>
                  <Ionicons
                    name={item.isLiked ? "heart" : "heart-outline"}
                    size={20}
                    color={item.isLiked ? "#ef4444" : "#8e8e93"}
                  />
                  <Text style={[styles.socialCount, item.isLiked && { color: "#ef4444" }]}>{item.likes || 0}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => handleComment(item.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chatbubble-outline" size={18} color="#8e8e93" />
                  <Text style={styles.socialCount}>{item.comments || 0}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.socialButton} onPress={() => handleShare(item)} activeOpacity={0.7}>
                  <Ionicons name="share-outline" size={18} color="#8e8e93" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="newspaper-outline" size={64} color="#c7d2fe" />
            </View>
            <Text style={styles.emptyTitle}>No articles yet</Text>
            <Text style={styles.emptySubtitle}>Pull down to refresh your wellness feed</Text>
          </View>
        }
      />

      {/* Options Modal for Android */}
      <Modal
        visible={showOptionsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptionsModal(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowOptionsModal(false)}>
          <View style={styles.optionsModal}>
            <TouchableOpacity style={styles.optionItem} onPress={() => handleOptionSelect(1)} activeOpacity={0.7}>
              <Ionicons name="bookmark-outline" size={20} color="#667eea" />
              <Text style={styles.optionText}>Save Article</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem} onPress={() => handleOptionSelect(2)} activeOpacity={0.7}>
              <Ionicons name="flag-outline" size={20} color="#f59e0b" />
              <Text style={styles.optionText}>Report Content</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionItem, styles.destructiveOption]}
              onPress={() => handleOptionSelect(3)}
              activeOpacity={0.7}
            >
              <Ionicons name="eye-off-outline" size={20} color="#ef4444" />
              <Text style={[styles.optionText, { color: "#ef4444" }]}>Hide Post</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

export default HealthTips

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
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
    paddingTop: statusBarHeight,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 44,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10b981",
    marginRight: 4,
  },
  liveText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    fontWeight: "500",
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  feedContainer: {
    paddingTop: 8,
    paddingBottom: 20, // Added bottom padding to remove the line
  },
  feedItem: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  articleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingBottom: 12,
  },
  sourceInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  sourceAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  sourceDetails: {
    flex: 1,
  },
  sourceName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  publishTime: {
    fontSize: 12,
    color: "#64748b",
  },
  moreButton: {
    padding: 8,
    marginRight: -8,
  },
  dotsContainer: {
    alignItems: "center",
    justifyContent: "space-between",
    height: 16,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#8e8e93",
    marginVertical: 1,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    lineHeight: 24,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  imageContainer: {
    position: "relative",
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  articleImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  readBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  readTime: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  articleActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  actionButton: {
    flex: 1,
    marginRight: 12,
  },
  readButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  readButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  socialActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  socialCount: {
    fontSize: 12,
    color: "#64748b",
    marginLeft: 4,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  optionsModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 32,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  destructiveOption: {
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1e293b",
    marginLeft: 12,
  },
})
