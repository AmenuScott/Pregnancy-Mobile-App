"use client"

import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import {
  Alert,
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"

const { width } = Dimensions.get("window")
const statusBarHeight = Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 24

// Baby care tips by age (reusing structure from PostNatalScreen for consistency)
const babyCareByAge = [
  {
    id: "1",
    ageGroup: "0-1 Month",
    tips: [
      {
        id: "1a",
        title: "Feeding",
        description: "Feed every 2-3 hours. Watch for hunger cues like rooting or sucking motions.",
        icon: "nutrition-outline",
      },
      {
        id: "1b",
        title: "Sleep",
        description: "Newborns sleep 14-17 hours daily. Always place baby on back to sleep.",
        icon: "bed-outline",
      },
      {
        id: "1c",
        title: "Diaper Care",
        description: "Change diapers frequently. Clean gently and watch for diaper rash.",
        icon: "refresh-outline",
      },
    ],
  },
  {
    id: "2",
    ageGroup: "1-3 Months",
    tips: [
      {
        id: "2a",
        title: "Tummy Time",
        description: "Start with 3-5 minutes, 2-3 times daily to strengthen neck muscles.",
        icon: "fitness-outline",
      },
      {
        id: "2b",
        title: "Interaction",
        description: "Talk, sing, and make eye contact. Baby will start to smile and coo.",
        icon: "chatbubble-outline",
      },
      {
        id: "2c",
        title: "Routine",
        description: "Establish feeding and sleeping routines to help baby feel secure.",
        icon: "time-outline",
      },
    ],
  },
  {
    id: "3",
    ageGroup: "3-6 Months",
    tips: [
      {
        id: "3a",
        title: "Development",
        description: "Baby may start rolling over and reaching for objects. Provide safe toys.",
        icon: "color-palette-outline",
      },
      {
        id: "3b",
        title: "Feeding Changes",
        description: "Around 4-6 months, you may introduce first foods alongside milk.",
        icon: "restaurant-outline",
      },
      {
        id: "3c",
        title: "Sleep Patterns",
        description: "Sleep patterns become more predictable. Night sleep may be longer.",
        icon: "moon-outline",
      },
    ],
  },
]

const BabyCareScreen = () => {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState("tips")
  const [babyDOB, setBabyDOB] = useState("")
  const [babyAgeWeeks, setBabyAgeWeeks] = useState<number | null>(null)
  const [storedDOB, setStoredDOB] = useState("")
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("1") // For tips section

  // On mount, try to load stored birth date
  useEffect(() => {
    const loadDOB = async () => {
      const savedDOB = await AsyncStorage.getItem("babyDOB")
      if (savedDOB) {
        setStoredDOB(savedDOB)
        calculateAge(savedDOB)
      }
    }
    loadDOB()
  }, [])

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
    // Basic date format validation
    if (!/^\d{4}-\d{2}-\d{2}$/.test(babyDOB)) {
      Alert.alert("Invalid Date Format", "Please use YYYY-MM-DD format for the birth date.")
      return
    }
    await AsyncStorage.setItem("babyDOB", babyDOB)
    setStoredDOB(babyDOB)
    calculateAge(babyDOB)
    setBabyDOB("")
    Alert.alert("Success", "Baby's birth date saved!")
  }

  const renderBabyCareTip = ({ item }: { item: any }) => (
    <View style={styles.babyCareTipCard} key={item.id}>
      <View style={styles.babyCareTipIcon}>
        <Ionicons name={item.icon} size={20} color="#4ECDC4" />
      </View>
      <View style={styles.babyCareTipContent}>
        <Text style={styles.babyCareTipTitle}>{item.title}</Text>
        <Text style={styles.babyCareTipDescription}>{item.description}</Text>
      </View>
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
          <View style={styles.statItem}>
            <Ionicons name="baby-outline" size={24} color="#4ECDC4" />
            <Text style={styles.statNumber}>{babyAgeWeeks !== null ? babyAgeWeeks : "--"}</Text>
            <Text style={styles.statLabel}>Weeks Old</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Ionicons name="scale-outline" size={24} color="#44A08D" />
            <Text style={styles.statNumber}>5.2</Text>
            <Text style={styles.statLabel}>kg Weight</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Ionicons name="resize-outline" size={24} color="#4ECDC4" />
            <Text style={styles.statNumber}>58</Text>
            <Text style={styles.statLabel}>cm Length</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent}>
          {[
            { id: "tips", label: "Care Tips", icon: "bulb" },
            { id: "mybaby", label: "My Baby", icon: "person" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabButton, selectedTab === tab.id && styles.tabButtonActive]}
              onPress={() => setSelectedTab(tab.id)}
            >
              <Ionicons
                name={tab.icon}
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === "tips" && (
          <View style={styles.tipsSection}>
            <Text style={styles.sectionTitle}>Baby Care Tips</Text>
            <Text style={styles.sectionSubtitle}>Age-specific guidance for your baby's development</Text>

            {/* Age Group Selector */}
            <View style={styles.ageGroupSelector}>
              {babyCareByAge.map((group) => (
                <TouchableOpacity
                  key={group.id}
                  style={[styles.ageGroupButton, selectedAgeGroup === group.id && styles.ageGroupButtonActive]}
                  onPress={() => setSelectedAgeGroup(group.id)}
                >
                  <Text
                    style={[
                      styles.ageGroupButtonText,
                      selectedAgeGroup === group.id && styles.ageGroupButtonTextActive,
                    ]}
                  >
                    {group.ageGroup}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Tips Content */}
            <View style={styles.babyCareContent}>
              {babyCareByAge
                .find((group) => group.id === selectedAgeGroup)
                ?.tips.map((tip) => renderBabyCareTip({ item: tip }))}
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <LinearGradient colors={["#E0F7FA", "#B2EBF2"]} style={styles.infoGradient}>
                <Ionicons name="information-circle" size={24} color="#00ACC1" />
                <Text style={styles.infoTitle}>Remember</Text>
                <Text style={styles.infoText}>
                  Every baby develops at their own pace. These are general guidelines. Always consult your pediatrician
                  for personalized advice and if you have any concerns about your baby's development.
                </Text>
              </LinearGradient>
            </View>
          </View>
        )}

        {selectedTab === "mybaby" && (
          <View style={styles.myBabySection}>
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
                    onChangeText={setBabyDOB}
                    keyboardType="numeric" // Suggest numeric keyboard for date input
                  />
                  <TouchableOpacity onPress={saveBabyDOB} style={styles.saveButton}>
                    <LinearGradient colors={["#4ECDC4", "#44A08D"]} style={styles.saveButtonGradient}>
                      <Ionicons name="calendar" size={18} color="white" />
                      <Text style={styles.saveButtonText}>Save Birth Date</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            ) : (
              <View style={styles.infoCard}>
                <LinearGradient colors={["#E0F7FA", "#B2EBF2"]} style={styles.infoGradient}>
                  <View style={styles.infoItem}>
                    <Ionicons name="calendar-outline" size={20} color="#00ACC1" />
                    <Text style={styles.infoItemText}>Born on: {storedDOB}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="baby-outline" size={20} color="#00ACC1" />
                    <Text style={styles.infoItemText}>Your baby is {babyAgeWeeks} week(s) old</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="medkit-outline" size={20} color="#00ACC1" />
                    <Text style={styles.infoItemText}>Next vaccine: 10-week immunization</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="bulb-outline" size={20} color="#00ACC1" />
                    <Text style={styles.infoItemText}>Personalized Tip: Introduce short tummy time daily</Text>
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
            )}
          </View>
        )}
      </ScrollView>
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
    flexDirection: "row",
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
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2d3748",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#718096",
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#e2e8f0",
    marginHorizontal: 15,
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
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#7F8C8D",
    marginBottom: 20,
  },
  tipsSection: {
    marginBottom: 20,
  },
  myBabySection: {
    marginBottom: 20,
  },
  ageGroupSelector: {
    flexDirection: "row",
    marginBottom: 20,
  },
  ageGroupButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    marginHorizontal: 5,
    borderRadius: 10,
  },
  ageGroupButtonActive: {
    backgroundColor: "#E0F7FA",
  },
  ageGroupButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#7F8C8D",
  },
  ageGroupButtonTextActive: {
    color: "#4ECDC4",
    fontWeight: "600",
  },
  babyCareContent: {
    marginBottom: 20,
  },
  babyCareTipCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  babyCareTipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0F7FA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  babyCareTipContent: {
    flex: 1,
  },
  babyCareTipTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 4,
  },
  babyCareTipDescription: {
    fontSize: 14,
    color: "#5D6D7E",
    lineHeight: 20,
  },
  infoCard: {
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoGradient: {
    borderRadius: 15,
    padding: 20,
    alignItems: "flex-start", // Align items to start for list
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
})
