"use client"

import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
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

// Define types for fetched data
type MenstrualLog = {
  id: string
  start_date: string
  flow_intensity: string
  symptoms: string[]
  notes: string
  created_at: string
}

type MenstrualInsight = {
  id: string
  title: string
  content: string
  category: string
}

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

  // API data states
  const [userId, setUserId] = useState<string | null>(null)
  const [menstrualLogs, setMenstrualLogs] = useState<MenstrualLog[]>([])
  const [menstrualInsights, setMenstrualInsights] = useState<MenstrualInsight[]>([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [nextPeriod, setNextPeriod] = useState<string | null>(null)
  const [averageCycle, setAverageCycle] = useState<number | null>(null)


  // Fetch userId on component mount
  useEffect(() => {
    const getUserId = async () => {
      const id = await AsyncStorage.getItem("userId")
      setUserId(id)
    }
    getUserId()
  }, [])

  // Fetch menstrual logs when tab is 'calendar' or userId changes
const fetchMenstrualLogs = useCallback(async () => {
  if (selectedTab === "calendar" && userId) {
    setLogsLoading(true)
    try {
      const response = await fetch(`https://pregwell-backend.onrender.com/api/menstrual-logs/${userId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setMenstrualLogs(data.logs || [])
      setNextPeriod(data.nextPeriod || null)
      setAverageCycle(data.averageCycle || null)
    } catch (error) {
      console.error("Error fetching menstrual logs:", error)
      Alert.alert("Error", "Failed to load menstrual logs. Please try again.")
      setMenstrualLogs([])
    } finally {
      setLogsLoading(false)
    }
  }
}, [selectedTab, userId])


  // Fetch menstrual insights when tab is 'insights' or userId changes
  const fetchMenstrualInsights = useCallback(async () => {
    if (selectedTab === "insights" && userId) {
      setInsightsLoading(true)
      try {
        const response = await fetch(`https://pregwell-backend.onrender.com/api/menstrual-insights/${userId}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setMenstrualInsights(data)
      } catch (error) {
        console.error("Error fetching menstrual insights:", error)
        Alert.alert("Error", "Failed to load menstrual insights. Please try again.")
        setMenstrualInsights([])
      } finally {
        setInsightsLoading(false)
      }
    }
  }, [selectedTab, userId])

  // Trigger fetches based on selectedTab and userId
  useEffect(() => {
    fetchMenstrualLogs()
    fetchMenstrualInsights()
  }, [fetchMenstrualLogs, fetchMenstrualInsights])

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId) ? prev.filter((id) => id !== symptomId) : [...prev, symptomId],
    )
  }

const saveMenstrualEntry = async () => {
  if (!cycleStartDate) {
    Alert.alert("Missing Information", "Please enter your cycle start date.");
    return;
  }

  try {
    const token = await AsyncStorage.getItem("token");
    const id = await AsyncStorage.getItem("userId"); // UUID

    if (!id || !token) {
      Alert.alert("Error", "Missing user ID or token.");
      return;
    }

    const res = await fetch("https://pregwell-backend.onrender.com/api/menstrual-logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        user_id: id, // Keep as string
        cycle_start_date: cycleStartDate,
        flow_intensity: flowIntensity,
        symptoms: selectedSymptoms.join(", "),
        notes: cycleNotes,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(`HTTP error! status: ${res.status}, message: ${errorData.message || "Unknown error"}`);
    }

    Alert.alert("Success", "Menstrual cycle entry saved successfully!");
    // Reset form
    setCycleStartDate("");
    setFlowIntensity("medium");
    setSelectedSymptoms([]);
    setCycleNotes("");
  } catch (error: any) {
    console.error("Error saving menstrual entry:", error.message);
    Alert.alert("Error", `Failed to save menstrual entry: ${error.message}`);
  }
};


  const formatLogDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    } catch (e) {
      return dateString
    }
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
            <Text style={styles.overviewNumber}>{averageCycle || "--"}</Text>

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
                <Text style={styles.predictionDate}>
  {nextPeriod
    ? new Date(nextPeriod).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Not enough data yet"}
</Text>
                <Text style={styles.predictionSubtext}>Based on your last cycle</Text>
              </LinearGradient>
            </View>

            {/* Cycle History */}
            <View style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Ionicons name="time" size={20} color="#FF9A56" />
                <Text style={styles.historyTitle}>Recent Cycles</Text>
              </View>
              {logsLoading ? (
                <ActivityIndicator size="small" color="#FF9A56" style={{ marginTop: 10 }} />
              ) : menstrualLogs.length > 0 ? (
                menstrualLogs.map((log) => (
                  <View key={log.id} style={styles.historyItem}>
                    <View style={styles.historyLeft}>
                      <Text style={styles.historyDate}>{formatLogDate(log.start_date)}</Text>
                      <Text style={styles.historyDetails}>
                        {log.flow_intensity.charAt(0).toUpperCase() + log.flow_intensity.slice(1)} flow •{" "}
                        {log.symptoms.length > 0 ? log.symptoms.join(", ") : "No symptoms"}
                      </Text>
                    </View>
                    <View style={styles.historyRight}>
                      <Ionicons name="chevron-forward" size={16} color="#7F8C8D" />
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyStateText}>No menstrual logs found.</Text>
              )}
            </View>
          </View>
        )}

        {selectedTab === "insights" && (
          <View style={styles.insightsSection}>
            <Text style={styles.sectionTitle}>Cycle Insights</Text>
            <Text style={styles.sectionSubtitle}>Understanding your postpartum cycle</Text>

            {insightsLoading ? (
              <ActivityIndicator size="small" color="#FF9A56" style={{ marginTop: 10 }} />
            ) : menstrualInsights.length > 0 ? (
              menstrualInsights.map((insight) => (
                <View key={insight.id} style={styles.insightCard}>
                  <LinearGradient
                    colors={
                      insight.category === "Postpartum"
                        ? ["#E3F2FD", "#BBDEFB"]
                        : insight.category === "Breastfeeding"
                          ? ["#FFF3E0", "#FFE0B2"]
                          : ["#F3E5F5", "#E1BEE7"]
                    }
                    style={styles.insightGradient}
                  >
                    <Ionicons
                      name={
                        insight.category === "Postpartum"
                          ? "information-circle"
                          : insight.category === "Breastfeeding"
                            ? "baby"
                            : "medical"
                      }
                      size={24}
                      color={
                        insight.category === "Postpartum"
                          ? "#2196F3"
                          : insight.category === "Breastfeeding"
                            ? "#FF9800"
                            : "#9C27B0"
                      }
                    />
                    <Text
                      style={[
                        styles.insightTitle,
                        {
                          color:
                            insight.category === "Postpartum"
                              ? "#2196F3"
                              : insight.category === "Breastfeeding"
                                ? "#FF9800"
                                : "#9C27B0",
                        },
                      ]}
                    >
                      {insight.title}
                    </Text>
                    <Text style={styles.insightText}>{insight.content}</Text>
                  </LinearGradient>
                </View>
              ))
            ) : (
              <Text style={styles.emptyStateText}>No insights found.</Text>
            )}
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
  emptyStateText: {
    fontSize: 14,
    color: "#7F8C8D",
    textAlign: "center",
    marginTop: 20,
  },
})

export default MenstrualScreen
