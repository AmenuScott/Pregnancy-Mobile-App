"use client"

import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useState } from "react"
import {
  Alert,
  Dimensions,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"

const { width } = Dimensions.get("window")

// Simplified recovery tips data
const recoveryTips = [
  {
    id: "1",
    title: "Rest & Recovery",
    description: "Get adequate sleep and rest when possible. Your body needs time to heal.",
    icon: "bed-outline",
    color: "#E91E63",
  },
  {
    id: "2",
    title: "Gentle Movement",
    description: "Start with light walking and gradually increase activity as you feel comfortable.",
    icon: "walk-outline",
    color: "#9C27B0",
  },
  {
    id: "3",
    title: "Proper Nutrition",
    description: "Eat nutritious meals to support healing and energy levels.",
    icon: "nutrition-outline",
    color: "#4CAF50",
  },
  {
    id: "4",
    title: "Stay Hydrated",
    description: "Drink plenty of water throughout the day to aid recovery.",
    icon: "water-outline",
    color: "#2196F3",
  },
]

// Baby care tips data
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

// Menstrual symptoms
const menstrualSymptoms = [
  { id: "cramps", label: "Cramps", icon: "flash-outline" },
  { id: "bloating", label: "Bloating", icon: "ellipse-outline" },
  { id: "headache", label: "Headache", icon: "skull-outline" },
  { id: "mood_swings", label: "Mood Swings", icon: "happy-outline" },
  { id: "fatigue", label: "Fatigue", icon: "battery-dead-outline" },
  { id: "breast_tenderness", label: "Breast Tenderness", icon: "heart-outline" },
]

const PostNatalScreen = () => {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState("recovery")
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("1")

  // Menstrual tracking state
  const [cycleStartDate, setCycleStartDate] = useState("")
  const [flowIntensity, setFlowIntensity] = useState("medium")
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [cycleNotes, setCycleNotes] = useState("")

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId) ? prev.filter((id) => id !== symptomId) : [...prev, symptomId],
    )
  }

  const saveMenstrualEntry = () => {
    if (!cycleStartDate) {
      Alert.alert("Missing Information", "Please enter your cycle start date.")
      return
    }
    Alert.alert("Success", "Menstrual cycle entry saved successfully!")
    // Reset form
    setCycleStartDate("")
    setFlowIntensity("medium")
    setSelectedSymptoms([])
    setCycleNotes("")
  }

  const renderRecoveryTip = ({ item }: { item: any }) => (
    <View style={styles.tipCard}>
      <LinearGradient colors={[`${item.color}15`, `${item.color}05`]} style={styles.tipCardGradient}>
        <View style={styles.tipHeader}>
          <View style={[styles.tipIconContainer, { backgroundColor: item.color }]}>
            <Ionicons name={item.icon} size={24} color="white" />
          </View>
          <Text style={styles.tipTitle}>{item.title}</Text>
        </View>
        <Text style={styles.tipDescription}>{item.description}</Text>
      </LinearGradient>
    </View>
  )

  const renderBabyCareTip = ({ item }: { item: any }) => (
    <View style={styles.babyCareTipCard}>
      <View style={styles.babyCareTipIcon}>
        <Ionicons name={item.icon} size={20} color="#E91E63" />
      </View>
      <View style={styles.babyCareTipContent}>
        <Text style={styles.babyCareTipTitle}>{item.title}</Text>
        <Text style={styles.babyCareTipDescription}>{item.description}</Text>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#FCE4EC", "#F06292", "#E91E63"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Post Natal Care</Text>
            <TouchableOpacity style={styles.infoButton}>
              <Ionicons name="information-circle" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.headerSubtitle}>
            <Ionicons name="heart" size={20} color="white" style={styles.headerIcon} />
            <Text style={styles.subtitleText}>Supporting your journey after birth</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Recovery Progress Card */}
      <View style={styles.progressContainer}>
        <LinearGradient colors={["#F8BBD0", "#FCE4EC"]} style={styles.progressGradient}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressTitle}>Recovery Journey</Text>
              <Text style={styles.progressSubtitle}>Week 6 postpartum</Text>
            </View>
            <View style={styles.progressPercentageContainer}>
              <Text style={styles.progressPercentage}>75%</Text>
            </View>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <LinearGradient colors={["#E91E63", "#C2185B"]} style={[styles.progressFill, { width: "75%" }]} />
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Tab Navigation - Only 3 tabs */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent}>
          {[
            { id: "recovery", label: "Recovery", icon: "fitness" },
            { id: "menstrual", label: "Menstrual", icon: "calendar" },
            { id: "babycare", label: "Baby Care", icon: "baby" },
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
        {selectedTab === "recovery" && (
          <View style={styles.recoverySection}>
            <Text style={styles.sectionTitle}>Recovery Tips</Text>
            <Text style={styles.sectionSubtitle}>Essential guidance for your postpartum recovery</Text>

            <FlatList
              data={recoveryTips}
              renderItem={renderRecoveryTip}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />

            <View style={styles.warningCard}>
              <LinearGradient colors={["#FFEBEE", "#FFCDD2"]} style={styles.warningGradient}>
                <Ionicons name="warning" size={24} color="#F44336" />
                <Text style={styles.warningTitle}>When to Call Your Doctor</Text>
                <Text style={styles.warningText}>
                  • Heavy bleeding or large blood clots{"\n"}• Fever over 100.4°F (38°C){"\n"}• Severe headache or
                  vision changes{"\n"}• Signs of infection at incision site{"\n"}• Severe abdominal or pelvic pain
                </Text>
              </LinearGradient>
            </View>
          </View>
        )}

        {selectedTab === "menstrual" && (
          <View style={styles.menstrualSection}>
            <Text style={styles.sectionTitle}>Menstrual Cycle Tracker</Text>
            <Text style={styles.sectionSubtitle}>Track the return of your menstrual cycle after childbirth</Text>

            {/* Cycle Tracker Card */}
            <View style={styles.menstrualTrackerCard}>
              <LinearGradient colors={["#FFF3E0", "#FFE0B2"]} style={styles.menstrualTrackerGradient}>
                <View style={styles.trackerHeader}>
                  <Ionicons name="calendar" size={24} color="#FF9800" />
                  <Text style={styles.menstrualTrackerTitle}>Log Your Period</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Last Period Start Date</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="MM/DD/YYYY"
                    value={cycleStartDate}
                    onChangeText={setCycleStartDate}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Flow Intensity</Text>
                  <View style={styles.flowOptions}>
                    {["light", "medium", "heavy"].map((flow) => (
                      <TouchableOpacity
                        key={flow}
                        style={[styles.flowOption, flowIntensity === flow && styles.flowOptionSelected]}
                        onPress={() => setFlowIntensity(flow)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.flowOptionText, flowIntensity === flow && styles.flowOptionTextSelected]}>
                          {flow.charAt(0).toUpperCase() + flow.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Symptoms</Text>
                  <View style={styles.symptomsGrid}>
                    {menstrualSymptoms.map((symptom) => (
                      <TouchableOpacity
                        key={symptom.id}
                        style={[
                          styles.symptomChip,
                          selectedSymptoms.includes(symptom.id) && styles.symptomChipSelected,
                        ]}
                        onPress={() => toggleSymptom(symptom.id)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={symptom.icon}
                          size={16}
                          color={selectedSymptoms.includes(symptom.id) ? "#FF9800" : "#7F8C8D"}
                        />
                        <Text
                          style={[
                            styles.symptomChipText,
                            selectedSymptoms.includes(symptom.id) && styles.symptomChipTextSelected,
                          ]}
                        >
                          {symptom.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Notes</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="Any additional symptoms or notes..."
                    value={cycleNotes}
                    onChangeText={setCycleNotes}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={saveMenstrualEntry} activeOpacity={0.8}>
                  <LinearGradient colors={["#FF9800", "#F57C00"]} style={styles.saveButtonGradient}>
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                    <Text style={styles.saveButtonText}>Save Entry</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </View>

            {/* Next Period Prediction */}
            <View style={styles.predictionCard}>
              <LinearGradient colors={["#E8F5E8", "#C8E6C9"]} style={styles.predictionGradient}>
                <View style={styles.predictionHeader}>
                  <Ionicons name="trending-up" size={24} color="#4CAF50" />
                  <Text style={styles.predictionTitle}>Next Period Estimate</Text>
                </View>
                <Text style={styles.predictionDate}>March 15, 2024</Text>
                <Text style={styles.predictionSubtext}>Based on your last cycle</Text>
              </LinearGradient>
            </View>

            <View style={styles.menstrualInfoCard}>
              <LinearGradient colors={["#FFF8E1", "#FFECB3"]} style={styles.menstrualInfoGradient}>
                <Ionicons name="information-circle" size={24} color="#FFA000" />
                <Text style={styles.menstrualInfoTitle}>Did You Know?</Text>
                <Text style={styles.menstrualInfoText}>
                  Periods typically return 6-8 weeks after delivery for non-breastfeeding mothers. For breastfeeding
                  mothers, it may take several months. The first few cycles may be irregular.
                </Text>
              </LinearGradient>
            </View>
          </View>
        )}

        {selectedTab === "babycare" && (
          <View style={styles.babyCareSection}>
            <Text style={styles.sectionTitle}>Baby Care Basics</Text>
            <Text style={styles.sectionSubtitle}>Essential care tips for your newborn</Text>

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

            <View style={styles.babyCareContent}>
              {babyCareByAge
                .find((group) => group.id === selectedAgeGroup)
                ?.tips.map((tip) => renderBabyCareTip({ item: tip }))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    paddingTop: 50,
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
  },
  headerIcon: {
    marginRight: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
  },
  progressContainer: {
    marginHorizontal: 20,
    marginTop: -15,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  progressGradient: {
    borderRadius: 20,
    padding: 20,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  progressSubtitle: {
    fontSize: 14,
    color: "#7F8C8D",
  },
  progressPercentageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E91E63",
    justifyContent: "center",
    alignItems: "center",
  },
  progressPercentage: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  progressBarContainer: {
    marginBottom: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(233, 30, 99, 0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  tabContainer: {
    backgroundColor: "white",
    paddingVertical: 15,
    marginTop: 20,
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
    backgroundColor: "#E91E63",
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

  // Recovery Section Styles
  recoverySection: {
    marginBottom: 20,
  },
  tipCard: {
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tipCardGradient: {
    borderRadius: 15,
    padding: 15,
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  tipDescription: {
    fontSize: 14,
    color: "#5D6D7E",
    lineHeight: 20,
  },
  warningCard: {
    borderRadius: 15,
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  warningGradient: {
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#F44336",
    marginTop: 10,
    marginBottom: 10,
  },
  warningText: {
    fontSize: 14,
    color: "#D32F2F",
    lineHeight: 20,
  },

  // Menstrual Section Styles
  menstrualSection: {
    marginBottom: 20,
  },
  menstrualTrackerCard: {
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menstrualTrackerGradient: {
    borderRadius: 15,
    padding: 20,
  },
  trackerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    justifyContent: "center",
  },
  menstrualTrackerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF9800",
    marginLeft: 10,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    color: "#2C3E50",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  flowOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  flowOption: {
    flex: 1,
    backgroundColor: "white",
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginHorizontal: 2,
    borderRadius: 8,
  },
  flowOptionSelected: {
    backgroundColor: "#FFF3E0",
    borderColor: "#FF9800",
  },
  flowOptionText: {
    color: "#7F8C8D",
    fontWeight: "500",
  },
  flowOptionTextSelected: {
    color: "#FF9800",
    fontWeight: "600",
  },
  symptomsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  symptomChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginRight: 8,
    marginBottom: 8,
  },
  symptomChipSelected: {
    backgroundColor: "#FFF3E0",
    borderColor: "#FF9800",
  },
  symptomChipText: {
    fontSize: 12,
    color: "#7F8C8D",
    marginLeft: 4,
  },
  symptomChipTextSelected: {
    color: "#FF9800",
    fontWeight: "600",
  },
  saveButton: {
    borderRadius: 25,
    overflow: "hidden",
    marginTop: 10,
    shadowColor: "#FF9800",
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
  predictionCard: {
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  predictionGradient: {
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },
  predictionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  predictionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
    marginLeft: 8,
  },
  predictionDate: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 5,
  },
  predictionSubtext: {
    fontSize: 14,
    color: "#7F8C8D",
  },
  menstrualInfoCard: {
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menstrualInfoGradient: {
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },
  menstrualInfoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFA000",
    marginTop: 10,
    marginBottom: 10,
  },
  menstrualInfoText: {
    fontSize: 14,
    color: "#5D6D7E",
    textAlign: "center",
    lineHeight: 20,
  },

  // Baby Care Section Styles
  babyCareSection: {
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
    backgroundColor: "#E3F2FD",
  },
  ageGroupButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#7F8C8D",
  },
  ageGroupButtonTextActive: {
    color: "#2196F3",
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
    backgroundColor: "#E3F2FD",
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
})

export default PostNatalScreen
