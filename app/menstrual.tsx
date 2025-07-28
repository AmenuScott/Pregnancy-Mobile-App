"use client"

import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useState } from "react"
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

// Menstrual symptoms
const menstrualSymptoms = [
  { id: "cramps", label: "Cramps", icon: "flash-outline" },
  { id: "bloating", label: "Bloating", icon: "ellipse-outline" },
  { id: "headache", label: "Headache", icon: "skull-outline" },
  { id: "mood_swings", label: "Mood Swings", icon: "happy-outline" },
  { id: "fatigue", label: "Fatigue", icon: "battery-dead-outline" },
  { id: "breast_tenderness", label: "Breast Tenderness", icon: "heart-outline" },
  { id: "back_pain", label: "Back Pain", icon: "body-outline" },
  { id: "nausea", label: "Nausea", icon: "sad-outline" },
]

const MenstrualScreen = () => {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState("tracker")

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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF9A56" />

      {/* Header */}
      <LinearGradient colors={["#FF9A56", "#FF6B35"]} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Menstrual Cycle</Text>
            <TouchableOpacity style={styles.infoButton}>
              <Ionicons name="information-circle" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.headerSubtitle}>
            <Ionicons name="calendar" size={20} color="white" style={styles.headerIcon} />
            <Text style={styles.subtitleText}>Track your cycle's return</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Cycle Overview Card */}
      <View style={styles.overviewContainer}>
        <LinearGradient colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.85)"]} style={styles.overviewCard}>
          <View style={styles.overviewItem}>
            <Ionicons name="calendar-outline" size={24} color="#FF9A56" />
            <Text style={styles.overviewNumber}>28</Text>
            <Text style={styles.overviewLabel}>Avg Cycle</Text>
          </View>

          <View style={styles.overviewDivider} />

          <View style={styles.overviewItem}>
            <Ionicons name="time-outline" size={24} color="#FF6B35" />
            <Text style={styles.overviewNumber}>5</Text>
            <Text style={styles.overviewLabel}>Days Flow</Text>
          </View>

          <View style={styles.overviewDivider} />

          <View style={styles.overviewItem}>
            <Ionicons name="trending-up-outline" size={24} color="#FF9A56" />
            <Text style={styles.overviewNumber}>12</Text>
            <Text style={styles.overviewLabel}>Days Until</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent}>
          {[
            { id: "tracker", label: "Log Period", icon: "add-circle" },
            { id: "calendar", label: "Cycle View", icon: "calendar" },
            { id: "insights", label: "Insights", icon: "analytics" },
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
        {selectedTab === "tracker" && (
          <View style={styles.trackerSection}>
            <Text style={styles.sectionTitle}>Log Your Period</Text>
            <Text style={styles.sectionSubtitle}>Track the return of your menstrual cycle after childbirth</Text>

            {/* Cycle Tracker Card */}
            <View style={styles.menstrualTrackerCard}>
              <LinearGradient colors={["#FFF3E0", "#FFE0B2"]} style={styles.menstrualTrackerGradient}>
                <View style={styles.trackerHeader}>
                  <Ionicons name="calendar" size={24} color="#FF9800" />
                  <Text style={styles.menstrualTrackerTitle}>Period Details</Text>
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
                    {[
                      { key: "light", label: "Light", icon: "water-outline" },
                      { key: "medium", label: "Medium", icon: "water" },
                      { key: "heavy", label: "Heavy", icon: "water-sharp" },
                    ].map((flow) => (
                      <TouchableOpacity
                        key={flow.key}
                        style={[styles.flowOption, flowIntensity === flow.key && styles.flowOptionSelected]}
                        onPress={() => setFlowIntensity(flow.key)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={flow.icon}
                          size={18}
                          color={flowIntensity === flow.key ? "#FF9800" : "#7F8C8D"}
                        />
                        <Text
                          style={[styles.flowOptionText, flowIntensity === flow.key && styles.flowOptionTextSelected]}
                        >
                          {flow.label}
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
          </View>
        )}

        {selectedTab === "calendar" && (
          <View style={styles.calendarSection}>
            <Text style={styles.sectionTitle}>Cycle Calendar</Text>
            <Text style={styles.sectionSubtitle}>Visual overview of your menstrual cycle</Text>

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

            {/* Cycle History */}
            <View style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Ionicons name="time" size={20} color="#FF9A56" />
                <Text style={styles.historyTitle}>Recent Cycles</Text>
              </View>

              {[
                { date: "Feb 15, 2024", duration: "5 days", flow: "Medium" },
                { date: "Jan 18, 2024", duration: "4 days", flow: "Light" },
                { date: "Dec 20, 2023", duration: "6 days", flow: "Heavy" },
              ].map((cycle, index) => (
                <View key={index} style={styles.historyItem}>
                  <View style={styles.historyLeft}>
                    <Text style={styles.historyDate}>{cycle.date}</Text>
                    <Text style={styles.historyDetails}>
                      {cycle.duration} • {cycle.flow} flow
                    </Text>
                  </View>
                  <View style={styles.historyRight}>
                    <Ionicons name="chevron-forward" size={16} color="#7F8C8D" />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {selectedTab === "insights" && (
          <View style={styles.insightsSection}>
            <Text style={styles.sectionTitle}>Cycle Insights</Text>
            <Text style={styles.sectionSubtitle}>Understanding your postpartum cycle</Text>

            {/* Insights Cards */}
            <View style={styles.insightCard}>
              <LinearGradient colors={["#E3F2FD", "#BBDEFB"]} style={styles.insightGradient}>
                <Ionicons name="information-circle" size={24} color="#2196F3" />
                <Text style={styles.insightTitle}>Postpartum Cycles</Text>
                <Text style={styles.insightText}>
                  Your first few cycles after childbirth may be irregular. This is completely normal as your body
                  adjusts to hormonal changes.
                </Text>
              </LinearGradient>
            </View>

            <View style={styles.insightCard}>
              <LinearGradient colors={["#FFF3E0", "#FFE0B2"]} style={styles.insightGradient}>
                <Ionicons name="baby" size={24} color="#FF9800" />
                <Text style={styles.insightTitle}>Breastfeeding Impact</Text>
                <Text style={styles.insightText}>
                  Breastfeeding can delay the return of your period. Some mothers don't get their period until they stop
                  breastfeeding completely.
                </Text>
              </LinearGradient>
            </View>

            <View style={styles.insightCard}>
              <LinearGradient colors={["#F3E5F5", "#E1BEE7"]} style={styles.insightGradient}>
                <Ionicons name="medical" size={24} color="#9C27B0" />
                <Text style={styles.insightTitle}>When to Consult</Text>
                <Text style={styles.insightText}>
                  Contact your healthcare provider if you experience very heavy bleeding, severe pain, or if your period
                  doesn't return within 3 months of stopping breastfeeding.
                </Text>
              </LinearGradient>
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
  overviewContainer: {
    marginHorizontal: 20,
    marginTop: -15,
    marginBottom: 20,
  },
  overviewCard: {
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
  overviewItem: {
    flex: 1,
    alignItems: "center",
  },
  overviewNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2d3748",
    marginTop: 8,
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
    color: "#718096",
    fontWeight: "500",
  },
  overviewDivider: {
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
    backgroundColor: "#FF9A56",
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
  trackerSection: {
    marginBottom: 20,
  },
  calendarSection: {
    marginBottom: 20,
  },
  insightsSection: {
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    paddingVertical: 12,
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
    marginLeft: 6,
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
  historyCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginLeft: 8,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  historyLeft: {
    flex: 1,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 2,
  },
  historyDetails: {
    fontSize: 12,
    color: "#7F8C8D",
  },
  historyRight: {
    padding: 4,
  },
  insightCard: {
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  insightGradient: {
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 10,
  },
  insightText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
})

export default MenstrualScreen
