"use client"

import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import {
    Alert,
    Dimensions,
    Platform,
    ScrollView,
    StatusBar,
    Text,
    View
} from "react-native"

const { width } = Dimensions.get("window")
const statusBarHeight = Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 24

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

  const [cycleStartDate, setCycleStartDate] = useState("")
  const [flowIntensity, setFlowIntensity] = useState("medium")
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [cycleNotes, setCycleNotes] = useState("")

  const [userId, setUserId] = useState("")
  const [insights, setInsights] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem("userId")
      if (id) setUserId(id)
    }
    fetchUserId()
  }, [])

  useEffect(() => {
    if (selectedTab === "insights" && userId) {
      fetch(`https://pregwell-backend.onrender.com/api/menstrual-insights/${userId}`)
        .then((res) => res.json())
        .then((data) => setInsights(data))
        .catch((err) => console.error("Insights fetch error:", err))
    }
    if (selectedTab === "calendar" && userId) {
      fetch(`https://pregwell-backend.onrender.com/api/menstrual-logs/${userId}`)
        .then((res) => res.json())
        .then((data) => setLogs(data))
        .catch((err) => console.error("Logs fetch error:", err))
    }
  }, [selectedTab, userId])

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId) ? prev.filter((id) => id !== symptomId) : [...prev, symptomId],
    )
  }

  const saveMenstrualEntry = async () => {
    if (!cycleStartDate) {
      Alert.alert("Missing Information", "Please enter your cycle start date.")
      return
    }

    try {
      const token = await AsyncStorage.getItem("token")
      const userId = await AsyncStorage.getItem("userId")
      const res = await fetch("https://pregwell-backend.onrender.com/api/menstrual-logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: userId,
          cycle_start_date: cycleStartDate,
          flow_intensity: flowIntensity,
          symptoms: selectedSymptoms.join(", "),
          notes: cycleNotes,
        }),
      })

      if (!res.ok) throw new Error("Failed to save entry")
      Alert.alert("Success", "Menstrual cycle entry saved successfully!")

      setCycleStartDate("")
      setFlowIntensity("medium")
      setSelectedSymptoms([])
      setCycleNotes("")
    } catch (error) {
      Alert.alert("Error", "Could not save your entry. Please try again later.")
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <ScrollView>
        {selectedTab === "insights" && (
          <View style={{ padding: 20 }}>
            {insights.length === 0 ? (
              <Text style={{ color: "gray", textAlign: "center" }}>No insights available.</Text>
            ) : (
              insights.map((insight, index) => (
                <View
                  key={index}
                  style={{ marginBottom: 16, padding: 16, backgroundColor: "#fff", borderRadius: 12 }}
                >
                  <Text style={{ fontWeight: "bold", fontSize: 16 }}>{insight.title}</Text>
                  <Text style={{ marginTop: 4, fontSize: 14 }}>{insight.description}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {selectedTab === "calendar" && (
          <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Your Logs</Text>
            {logs.length === 0 ? (
              <Text style={{ color: "gray", textAlign: "center" }}>No logs yet.</Text>
            ) : (
              logs.map((log, index) => (
                <View
                  key={index}
                  style={{ marginBottom: 16, padding: 16, backgroundColor: "#fff", borderRadius: 12 }}
                >
                  <Text style={{ fontWeight: "bold" }}>{log.cycle_start_date}</Text>
                  <Text>Flow: {log.flow_intensity}</Text>
                  <Text>Symptoms: {log.symptoms}</Text>
                  {log.notes ? <Text>Notes: {log.notes}</Text> : null}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default MenstrualScreen
