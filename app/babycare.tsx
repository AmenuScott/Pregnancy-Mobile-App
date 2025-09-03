"use client"

import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import {
  ActionSheetIOS, // Added ActionSheetIOS for iOS options
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image, // Added RefreshControl for pull-to-refresh
  Linking, // Added Share for news articles
  Modal,
  Platform, // Added ActivityIndicator for loading state
  RefreshControl,
  SafeAreaView,
  ScrollView, // Added FlatList for news feed
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { track } from "../lib/analytics"

const { width } = Dimensions.get("window")
const statusBarHeight = Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 24

// Define type for news articles
interface BabyNewsArticle {
  id: number
  title: string
  description: string
  image_url: string
  link: string
  source: string
  likes?: number
  comments?: number
  isLiked?: boolean
}

interface PersonalizedTip {
  id: number
  title: string
  description: string
  image_url: string
  category: string
}

const BabyCareScreen = () => {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState("newsFeed") // Changed default tab to 'newsFeed'
  const [babyDOB, setBabyDOB] = useState("")
  const [storedDOB, setStoredDOB] = useState("")
  const [babyAgeWeeks, setBabyAgeWeeks] = useState<number | null>(null)

  // State for news feed
  const [newsArticles, setNewsArticles] = useState<BabyNewsArticle[]>([])
  const [newsLoading, setNewsLoading] = useState(true)
  const [newsRefreshing, setNewsRefreshing] = useState(false)
  const [showOptionsModal, setShowOptionsModal] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<BabyNewsArticle | null>(null)

  // State for personalized tips
  const [personalizedTips, setPersonalizedTips] = useState<PersonalizedTip[]>([])
  const [loadingPersonalized, setLoadingPersonalized] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  // On mount, try to load stored birth date and fetch news articles
  useEffect(() => {
    const loadData = async () => {
      const savedDOB = await AsyncStorage.getItem("babyDOB")
      const savedUserId = await AsyncStorage.getItem("userId")
      if (savedUserId) setUserId(savedUserId)

      if (savedDOB) {
        setStoredDOB(savedDOB)
        calculateAge(savedDOB)
        if (savedUserId) fetchPersonalizedTips(savedUserId, savedDOB) // Pass DOB for personalized tips
      }
      fetchNewsArticles() // Fetch news articles on component mount
    }
    loadData()
  }, [])

  // Fetch news articles on component mount or refresh
  const fetchNewsArticles = async () => {
    setNewsLoading(true)
    try {
      // Placeholder for fetching real news articles
      // In a real app, you would fetch from your backend API
      const dummyArticles: BabyNewsArticle[] = [
        {
          id: 1,
          title: "Understanding Newborn Sleep Patterns",
          description: "Learn about typical sleep cycles for newborns and tips for better rest.",
          image_url: "https://images.unsplash.com/photo-1512626128473-78d5579b6235?w=400&h=200&fit=crop&q=80",
          link: "https://www.example.com/newborn-sleep",
          source: "BabyHealth.com",
          likes: 120,
          comments: 35,
          isLiked: false,
        },
        {
          id: 2,
          title: "The Importance of Tummy Time for Development",
          description: "Discover why tummy time is crucial for your baby's motor skills.",
          image_url: "https://images.unsplash.com/photo-1586882828772-da400c587091?w=400&h=200&fit=crop&q=80",
          link: "https://www.example.com/tummy-time",
          source: "ParentingGuide.org",
          likes: 98,
          comments: 22,
          isLiked: false,
        },
        {
          id: 3,
          title: "First Foods: A Guide to Introducing Solids",
          description: "When and how to start introducing solid foods to your baby.",
          image_url: "https://images.unsplash.com/photo-1512626128473-78d5579b6235?w=400&h=200&fit=crop&q=80",
          link: "https://www.example.com/introducing-solids",
          source: "NutritionForBabies.com",
          likes: 150,
          comments: 40,
          isLiked: false,
        },
        {
          id: 4,
          title: "Milestones: What to Expect in the First Year",
          description: "A comprehensive guide to your baby's developmental milestones.",
          image_url: "https://images.unsplash.com/photo-1586882828772-da400c587091?w=400&h=200&fit=crop&q=80",
          link: "https://www.example.com/baby-milestones",
          source: "ChildDevelopment.org",
          likes: 110,
          comments: 28,
          isLiked: false,
        },
      ]
      setNewsArticles(dummyArticles)
    } catch (error) {
      console.error("Error fetching news articles:", error)
      Alert.alert("Error", "Failed to load news articles. Please try again.")
      setNewsArticles([])
    } finally {
      setNewsLoading(false)
      setNewsRefreshing(false)
    }
  }

  const onNewsRefresh = async () => {
    setNewsRefreshing(true)
    await fetchNewsArticles()
  }

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob)
    const today = new Date()
    const ageInMs = today.getTime() - birthDate.getTime()
    const ageInWeeks = Math.floor(ageInMs / (1000 * 60 * 60 * 24 * 7))
    setBabyAgeWeeks(ageInWeeks)
  }

  const saveBabyDOB = async () => {
    if (!babyDOB) {
      Alert.alert("Enter Baby's Birth Date", "Please enter your baby's birth date in YYYY-MM-DD format.")
      return
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(babyDOB)) {
      Alert.alert("Invalid Date Format", "Please use YYYY-MM-DD format for the birth date.")
      return
    }
    await AsyncStorage.setItem("babyDOB", babyDOB)
    setStoredDOB(babyDOB)
    calculateAge(babyDOB)
    setBabyDOB("")
    Alert.alert("Success", "Baby's birth date saved!")
    if (userId) fetchPersonalizedTips(userId, babyDOB) // Fetch personalized tips after saving DOB
  track("baby_dob_saved", { dob: babyDOB })
  }

  // Auto-format YYYY-MM-DD while typing
  const formatBabyDateInput = (text: string) => {
    const cleaned = text.replace(/\D/g, "")
    if (cleaned.length <= 4) return cleaned
    if (cleaned.length <= 6) return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}`
  }

  const fetchPersonalizedTips = async (uid: string, dob: string) => {
    if (!uid || !dob) return
    setLoadingPersonalized(true)
    try {
      // Simulate fetching personalized tips based on baby's age
      const birthDate = new Date(dob)
      const today = new Date()
      const ageInMs = today.getTime() - birthDate.getTime()
      const ageInWeeks = Math.floor(ageInMs / (1000 * 60 * 60 * 24 * 7))

      let tips: PersonalizedTip[] = []
      if (ageInWeeks < 4) {
        // 0-1 month
        tips = [
          {
            id: 101,
            title: "Newborn Feeding Cues",
            description: "Recognize early hunger signs like rooting and lip smacking.",
            image_url: "https://images.unsplash.com/photo-1586882828772-da400c587091?w=400&h=200&fit=crop&q=80",
            category: "Feeding",
          },
          {
            id: 102,
            title: "Safe Sleep Practices",
            description: "Always place your baby on their back to sleep in a crib free of loose bedding.",
            image_url: "https://images.unsplash.com/photo-1512626128473-78d5579b6235?w=400&h=200&fit=crop&q=80",
            category: "Sleep",
          },
        ]
      } else if (ageInWeeks >= 4 && ageInWeeks < 12) {
        // 1-3 months
        tips = [
          {
            id: 103,
            title: "Starting Tummy Time",
            description: "Begin with short sessions of tummy time to strengthen neck and core muscles.",
            image_url: "https://images.unsplash.com/photo-1586882828772-da400c587091?w=400&h=200&fit=crop&q=80",
            category: "Development",
          },
          {
            id: 104,
            title: "Interacting with Your Baby",
            description: "Engage with your baby through talking, singing, and making eye contact to foster bonding.",
            image_url: "https://images.unsplash.com/photo-1512626128473-78d5579b6235?w=400&h=200&fit=crop&q=80",
            category: "Bonding",
          },
        ]
      } else if (ageInWeeks >= 12 && ageInWeeks < 24) {
        // 3-6 months
        tips = [
          {
            id: 105,
            title: "Introducing Solid Foods",
            description: "Look for signs of readiness before introducing pureed solids, usually around 4-6 months.",
            image_url: "https://images.unsplash.com/photo-1512626128473-78d5579b6235?w=400&h=200&fit=crop&q=80",
            category: "Feeding",
          },
          {
            id: 106,
            title: "Encouraging Rolling",
            description: "Help your baby practice rolling from back to tummy and vice versa.",
            image_url: "https://images.unsplash.com/photo-1586882828772-da400c587091?w=400&h=200&fit=crop&q=80",
            category: "Development",
          },
        ]
      } else {
        // 6+ months
        tips = [
          {
            id: 107,
            title: "Baby-Led Weaning Basics",
            description: "Explore introducing finger foods and allowing your baby to self-feed.",
            image_url: "https://images.unsplash.com/photo-1512626128473-78d5579b6235?w=400&h=200&fit=crop&q=80",
            category: "Feeding",
          },
          {
            id: 108,
            title: "Encouraging Crawling",
            description: "Create a safe environment for your baby to explore and practice crawling.",
            image_url: "https://images.unsplash.com/photo-1586882828772-da400c587091?w=400&h=200&fit=crop&q=80",
            category: "Development",
          },
        ]
      }
      setPersonalizedTips(tips)
    } catch (error) {
      console.error("Error fetching personalized tips:", error)
    } finally {
      setLoadingPersonalized(false)
    }
  }

  const handleLike = (articleId: number) => {
    setNewsArticles((prevArticles) =>
      prevArticles.map((article) =>
        article.id === articleId
          ? {
              ...article,
              isLiked: !article.isLiked,
              likes: article.isLiked ? (article.likes || 0) - 1 : (article.likes || 0) + 1,
            }
          : article,
      ),
    )
  }

  const handleComment = (articleId: number) => {
    setNewsArticles((prevArticles) =>
      prevArticles.map((article) =>
        article.id === articleId ? { ...article, comments: (article.comments || 0) + 1 } : article,
      ),
    )
    Alert.alert("Comment", "Comment feature coming soon! 💬")
  }

  const handleShare = async (article: BabyNewsArticle) => {
    try {
      await Share.share({
        message: `Check out this baby care article: ${article.title}\n\nRead more: ${article.link}`,
        title: article.title,
        url: article.link,
      })
    } catch (error) {
      console.error("Share error:", error)
    }
  }

  const showOptions = (article: BabyNewsArticle) => {
    setSelectedArticle(article)

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

    setSelectedArticle(null)
  }

  const renderNewsArticle = ({ item }: { item: BabyNewsArticle }) => (
    <View style={styles.newsFeedItem}>
      {/* Article Header */}
      <View style={styles.articleHeader}>
        <View style={styles.sourceInfo}>
          <View style={styles.sourceAvatar}>
            <Ionicons name="newspaper-outline" size={16} color="#4ECDC4" />
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
      <Text style={styles.articleDescription}>{item.description}</Text>

      {/* Article Image */}
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={() => Linking.openURL(item.link || "https://www.example.com")}
        activeOpacity={0.95}
      >
        <Image
          source={{
            uri: item.image_url?.startsWith("http")
              ? item.image_url
              : "https://via.placeholder.com/400x200?text=Baby+Care+News",
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
          onPress={() => Linking.openURL(item.link || "https://www.example.com")}
          activeOpacity={0.8}
        >
          <LinearGradient colors={["#4ECDC4", "#44A08D"]} style={styles.readButton}>
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

          <TouchableOpacity style={styles.socialButton} onPress={() => handleComment(item.id)} activeOpacity={0.7}>
            <Ionicons name="chatbubble-outline" size={18} color="#8e8e93" />
            <Text style={styles.socialCount}>{item.comments || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton} onPress={() => handleShare(item)} activeOpacity={0.7}>
            <Ionicons name="share-outline" size={18} color="#8e8e93" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )

  const renderPersonalizedTip = ({ item }: { item: PersonalizedTip }) => (
    <View style={styles.personalizedTipCard}>
      <LinearGradient colors={["#E0F7FA", "#B2EBF2"]} style={styles.personalizedTipGradient}>
        <View style={styles.personalizedTipHeader}>
          <Ionicons name="bulb-outline" size={20} color="#00ACC1" />
          <Text style={styles.personalizedTipTitle}>{item.title}</Text>
        </View>
        <Text style={styles.personalizedTipDescription}>{item.description}</Text>
        {item.image_url && <Image source={{ uri: item.image_url }} style={styles.personalizedTipImage} />}
      </LinearGradient>
    </View>
  )

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4ECDC4" />

      {/* Header */}
      <LinearGradient colors={["#4ECDC4", "#44A08D"]} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Baby Care Guide</Text>
            <TouchableOpacity style={styles.infoButton}>
              <Ionicons name="information-circle" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.headerSubtitle}>
            <Ionicons name="heart" size={20} color="white" style={styles.headerIcon} />
            <Text style={styles.subtitleText}>Essential care for your little one</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Baby Stats Card */}
      <View style={styles.statsContainer}>
        <LinearGradient colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.85)"]} style={styles.statsCard}>
          <View style={styles.singleStatItem}>
            <Ionicons name={"baby-outline" as any} size={24} color="#4ECDC4" />
            <Text style={styles.singleStatText}>
              Your Baby is: {babyAgeWeeks !== null ? `${babyAgeWeeks} week(s) old` : "--"}
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent}>
          {[
            { id: "newsFeed", label: "News Feed", icon: "newspaper" }, // Changed label and icon
            { id: "mybaby", label: "My Baby", icon: "person" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabButton, selectedTab === tab.id && styles.tabButtonActive]}
              onPress={() => setSelectedTab(tab.id)}
            >
              <Ionicons
                name={tab.icon as any}
                size={16}
                color={selectedTab === tab.id ? "white" : "#7F8C8D"}
                style={styles.tabIcon}
              />
              <Text style={[styles.tabButtonText, selectedTab === tab.id && styles.tabButtonTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Conditional Content Rendering */}
      {selectedTab === "newsFeed" && (
        <View style={styles.newsFeedSection}>
          <Text style={styles.sectionTitle}>Baby Care News</Text>
          <Text style={styles.sectionSubtitle}>Latest articles and updates for new parents</Text>

          {newsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4ECDC4" />
              <Text style={styles.loadingText}>Loading news...</Text>
            </View>
          ) : (
            <FlatList
              data={newsArticles}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderNewsArticle}
              contentContainerStyle={styles.newsFeedListContainer}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={newsRefreshing}
                  onRefresh={onNewsRefresh}
                  colors={["#4ECDC4"]}
                  tintColor="#4ECDC4"
                  progressBackgroundColor="#fff"
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <View style={styles.emptyIcon}>
                    <Ionicons name="newspaper-outline" size={64} color="#c7d2fe" />
                  </View>
                  <Text style={styles.emptyTitle}>No articles yet</Text>
                  <Text style={styles.emptySubtitle}>Pull down to refresh your news feed</Text>
                </View>
              }
            />
          )}
        </View>
      )}

      {selectedTab === "mybaby" && (
        <ScrollView style={styles.myBabyScrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.myBabySectionContent}>
            <Text style={styles.sectionTitle}>My Baby's Profile</Text>
            <Text style={styles.sectionSubtitle}>Manage your baby's key information</Text>

            {!storedDOB ? (
              <View style={styles.inputCard}>
                <LinearGradient colors={["#F0F4F8", "#E6EEF3"]} style={styles.inputCardGradient}>
                  <Text style={styles.label}>Enter Baby's Birth Date</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    value={babyDOB}
                    onChangeText={(t) => setBabyDOB(formatBabyDateInput(t))}
                    keyboardType="number-pad"
                    maxLength={10}
                  />
                  <Text style={styles.helperText}>Format: YYYY-MM-DD</Text>
                  <TouchableOpacity onPress={saveBabyDOB} style={styles.saveButton}>
                    <LinearGradient colors={["#4ECDC4", "#44A08D"]} style={styles.saveButtonGradient}>
                      <Ionicons name="calendar" size={18} color="white" />
                      <Text style={styles.saveButtonText}>Save Birth Date</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            ) : (
              <>
                <View style={styles.infoCard}>
                  <LinearGradient colors={["#E0F7FA", "#B2EBF2"]} style={styles.infoGradient}>
                    <View style={styles.infoItem}>
                      <Ionicons name="calendar-outline" size={20} color="#00ACC1" />
                      <Text style={styles.infoItemText}>Born on: {storedDOB}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Ionicons name={"baby-outline" as any} size={20} color="#00ACC1" />
                      <Text style={styles.infoItemText}>Your baby is {babyAgeWeeks} week(s) old</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Ionicons name="medkit-outline" size={20} color="#00ACC1" />
                      <Text style={styles.infoItemText}>Next vaccine: 10-week immunization</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Ionicons name="sparkles-outline" size={20} color="#00ACC1" />
                      <Text style={styles.infoItemText}>You're doing amazing! Keep it up 💖</Text>
                    </View>
                    <TouchableOpacity onPress={() => setStoredDOB("")} style={styles.editButton}>
                      <Ionicons name="pencil-outline" size={16} color="#00ACC1" />
                      <Text style={styles.editButtonText}>Edit Birth Date</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>

                <Text style={styles.sectionTitle}>Personalized Tips</Text>
                <Text style={styles.sectionSubtitle}>Tips tailored to your baby's age and development</Text>

                {loadingPersonalized ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4ECDC4" />
                    <Text style={styles.loadingText}>Loading personalized tips...</Text>
                  </View>
                ) : personalizedTips.length === 0 ? (
                  <View style={styles.emptyState}>
                    <View style={styles.emptyIcon}>
                      <Ionicons name="bulb-outline" size={64} color="#c7d2fe" />
                    </View>
                    <Text style={styles.emptyTitle}>No personalized tips yet</Text>
                    <Text style={styles.emptySubtitle}>Enter your baby's birth date to get tailored advice!</Text>
                  </View>
                ) : (
                  <View style={styles.personalizedTipsListContainer}>
                    {personalizedTips.map((tip: PersonalizedTip) => (
                      <View key={tip.id.toString()} style={styles.personalizedTipCard}>
                        {renderPersonalizedTip({ item: tip })}
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        </ScrollView>
      )}

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
              <Ionicons name="bookmark-outline" size={20} color="#4ECDC4" />
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

export default BabyCareScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingTop: statusBarHeight + 10,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
  },
  infoButton: {
    padding: 8,
  },
  headerSubtitle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerIcon: {
    marginRight: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
  },
  statsContainer: {
    marginHorizontal: 20,
    marginTop: -15,
    marginBottom: 20,
  },
  statsCard: {
    flexDirection: "row", // Keep as row for potential future expansion, but only one item now
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  // Removed statItem, statNumber, statLabel, statDivider
  singleStatItem: {
    flex: 1, // Take full width
    alignItems: "center", // Center content horizontally
    justifyContent: "center", // Center content vertically
    flexDirection: "row", // Arrange icon and text in a row
  },
  singleStatText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2d3748",
    marginLeft: 10, // Space between icon and text
  },
  tabContainer: {
    backgroundColor: "white",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  tabScrollContent: {
    paddingHorizontal: 15,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
  },
  tabButtonActive: {
    backgroundColor: "#4ECDC4",
  },
  tabIcon: {
    marginRight: 6,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#7F8C8D",
  },
  tabButtonTextActive: {
    color: "white",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 5,
    paddingHorizontal: 20, // Added padding for consistency
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#7F8C8D",
    marginBottom: 20,
    paddingHorizontal: 20, // Added padding for consistency
  },
  newsFeedSection: {
    flex: 1, // Allow FlatList to take available space
    marginBottom: 20,
  },
  // (Removed duplicate myBabySectionContent here; defined at bottom)
  newsFeedListContainer: {
    paddingBottom: 20,
    paddingHorizontal: 20, // Added padding here for news feed items
  },
  newsFeedItem: {
    backgroundColor: "#fff",
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
    backgroundColor: "#e0f7fa", // Light blue for news
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
    marginBottom: 8,
  },
  articleDescription: {
    fontSize: 14,
    color: "#4a5568",
    lineHeight: 20,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#4ECDC4",
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
  infoCard: {
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20, // Added margin for spacing
  },
  infoGradient: {
    borderRadius: 15,
    padding: 20,
    alignItems: "flex-start",
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#00ACC1",
    marginTop: 10,
    marginBottom: 10,
    textAlign: "center",
    width: "100%",
  },
  infoText: {
    fontSize: 14,
    color: "#00695C",
    textAlign: "center",
    lineHeight: 20,
  },
  inputCard: {
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputCardGradient: {
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#2C3E50",
  },
  input: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: "#2C3E50",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    width: "100%",
    marginBottom: 15,
  },
  saveButton: {
    width: "100%",
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#4ECDC4",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  saveButtonGradient: {
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 25,
    flexDirection: "row",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    width: "100%",
  },
  infoItemText: {
    fontSize: 14,
    color: "#00695C",
    marginLeft: 10,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: "#E0F7FA",
  },
  editButtonText: {
    color: "#00ACC1",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 5,
  },
  personalizedTipsListContainer: {
    paddingBottom: 20,
  },
  personalizedTipCard: {
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  personalizedTipGradient: {
    borderRadius: 15,
    padding: 20,
  },
  personalizedTipHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  personalizedTipTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#00ACC1",
    marginLeft: 8,
  },
  personalizedTipDescription: {
    fontSize: 14,
    color: "#5D6D7E",
    lineHeight: 20,
    marginBottom: 10,
  },
  personalizedTipImage: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    resizeMode: "cover",
    marginTop: 10,
  },
  myBabyScrollView: {
    flex: 1,
    paddingHorizontal: 20, // Apply padding here
  },
  myBabySectionContent: {
    paddingBottom: 20, // Add bottom padding for content within the scroll view
  },
  helperText: {
    fontSize: 11,
    color: "#7F8C8D",
    marginTop: -10,
    marginBottom: 12,
    alignSelf: "flex-start",
  },
})
