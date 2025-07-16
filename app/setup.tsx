"use client"

import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { jwtDecode } from "jwt-decode"
import { useEffect, useState } from "react"
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"

const { width } = Dimensions.get("window")

const healthConditions = [
  { id: "diabetes", name: "Diabetes", icon: "medical-outline", color: "#FF6B9D" },
  { id: "hypertension", name: "High Blood Pressure", icon: "heart-outline", color: "#FF5722" },
  { id: "asthma", name: "Asthma", icon: "fitness-outline", color: "#4ECDC4" },
  { id: "thyroid", name: "Thyroid Issues", icon: "body-outline", color: "#FFA726" },
  { id: "anemia", name: "Anemia", icon: "water-outline", color: "#9C27B0" },
  { id: "allergies", name: "Allergies", icon: "leaf-outline", color: "#4CAF50" },
]

export default function SetupNew() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [lmp, setLmp] = useState("")
  const [isFirstPregnancy, setIsFirstPregnancy] = useState<boolean | null>(null)
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [otherCondition, setOtherCondition] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const getUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId")
        if (storedUserId) {
          setUserId(storedUserId)
          return
        }

        const token = await AsyncStorage.getItem("token")
        if (token) {
          const decoded = jwtDecode<{ id?: string; userId?: string; user_id?: string; sub?: string }>(token)
          const actualUserId = decoded.id || decoded.userId || decoded.user_id || decoded.sub
          if (actualUserId) {
            setUserId(actualUserId.toString())
          }
        }
      } catch (err) {
        console.error("Error getting user ID:", err)
      }
    }
    getUserId()
  }, [])

  const formatDateInput = (text: string) => {
    const cleaned = text.replace(/\D/g, "")
    if (cleaned.length <= 4) return cleaned
    if (cleaned.length <= 6) return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}`
  }

  const toggleHealthCondition = (conditionId: string) => {
    setSelectedConditions((prev) =>
      prev.includes(conditionId) ? prev.filter((id) => id !== conditionId) : [...prev, conditionId],
    )
  }

  const validateForm = () => {
    if (!lmp) {
      Alert.alert("Missing Information", "Please enter your last menstrual period date.")
      return false
    }
    if (isFirstPregnancy === null) {
      Alert.alert("Missing Information", "Please indicate if this is your first pregnancy.")
      return false
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(lmp)) {
      Alert.alert("Invalid Date", "Please enter the date in YYYY-MM-DD format.")
      return false
    }
    return true
  }

  const handleContinue = async () => {
    if (!validateForm()) return
    setLoading(true)

    try {
      const token = await AsyncStorage.getItem("token")
      if (!token) {
        Alert.alert("Authentication Error", "You must be logged in to continue.")
        setLoading(false)
        return
      }

      const finalUserId = userId || (await AsyncStorage.getItem("userId"))
      if (!finalUserId) {
        Alert.alert("Missing User", "User ID not found. Please log in again.")
        setLoading(false)
        return
      }

      const setupData = {
        last_menstrual_period: lmp,
        first_pregnancy: isFirstPregnancy,
        health_conditions: selectedConditions,
        other_condition: otherCondition.trim(),
      }

      const response = await fetch(`https://pregwell-backend.onrender.com/api/patients/setup/${finalUserId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(setupData),
      })

      const data = await response.json()

      if (response.ok) {
        await AsyncStorage.setItem("profileCompleted", "true")
        Alert.alert("Success 🎉", "Your profile has been set up successfully!", [
          { text: "Continue", onPress: () => router.replace("/login") },
        ])
      } else {
        Alert.alert("Setup Failed", data.error || "Something went wrong. Please try again.")
      }
    } catch (error) {
      console.error("Setup error:", error)
      Alert.alert("Connection Error", "Unable to connect to the server.")
    }
    setLoading(false)
  }

  const progress =
    ((lmp ? 1 : 0) + (isFirstPregnancy !== null ? 1 : 0) + (selectedConditions.length > 0 || otherCondition ? 1 : 0)) *
    33.33

  return (
    <SafeAreaView style={s.container}>
      <LinearGradient colors={["#F8F9FA", "#FFFFFF"]} style={s.bg}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>Complete Your Profile</Text>
          <Text style={s.subtitle}>Help us personalize your pregnancy journey</Text>

          {/* Progress */}
          <View style={s.progressContainer}>
            <View style={s.progressBg}>
              <View style={[s.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={s.progressText}>{Math.round(progress)}% Complete</Text>
          </View>
        </View>

        <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
            {/* LMP Section */}
            <View style={s.card}>
              <View style={s.cardHeader}>
                <Ionicons name="calendar-outline" size={24} color="#9C27B0" />
                <Text style={s.cardTitle}>Last Menstrual Period</Text>
              </View>
              <Text style={s.cardDesc}>When did your last period start?</Text>

              <View style={s.inputContainer}>
                <View style={s.inputWrapper}>
                  <Ionicons name="calendar-outline" size={20} color="#9C27B0" />
                  <TextInput
                    style={s.input}
                    value={lmp}
                    onChangeText={(text) => setLmp(formatDateInput(text))}
                    placeholder="2024-01-15"
                    placeholderTextColor="#BDC3C7"
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>
                <Text style={s.hint}>This helps calculate your due date and pregnancy week</Text>
              </View>
            </View>

            {/* Pregnancy History */}
            <View style={s.card}>
              <View style={s.cardHeader}>
                <Ionicons name="heart-outline" size={24} color="#FF6B9D" />
                <Text style={s.cardTitle}>Pregnancy History</Text>
              </View>
              <Text style={s.cardDesc}>Is this your first pregnancy?</Text>

              <View style={s.radioContainer}>
                <TouchableOpacity
                  style={[s.radioOption, isFirstPregnancy === true && s.radioSelected]}
                  onPress={() => setIsFirstPregnancy(true)}
                >
                  <View style={[s.radioCircle, isFirstPregnancy === true && s.radioCircleActive]}>
                    {isFirstPregnancy === true && <View style={s.radioInner} />}
                  </View>
                  <View>
                    <Text style={[s.radioText, isFirstPregnancy === true && s.radioTextActive]}>
                      Yes, this is my first pregnancy
                    </Text>
                    <Text style={s.radioSub}>First-time mom</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[s.radioOption, isFirstPregnancy === false && s.radioSelected]}
                  onPress={() => setIsFirstPregnancy(false)}
                >
                  <View style={[s.radioCircle, isFirstPregnancy === false && s.radioCircleActive]}>
                    {isFirstPregnancy === false && <View style={s.radioInner} />}
                  </View>
                  <View>
                    <Text style={[s.radioText, isFirstPregnancy === false && s.radioTextActive]}>
                      No, I've been pregnant before
                    </Text>
                    <Text style={s.radioSub}>Experienced mom</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Health Conditions */}
            <View style={s.card}>
              <View style={s.cardHeader}>
                <Ionicons name="medical-outline" size={24} color="#4ECDC4" />
                <Text style={s.cardTitle}>Health Conditions</Text>
              </View>
              <Text style={s.cardDesc}>Select any conditions that apply to you (optional)</Text>

              <View style={s.conditionsGrid}>
                {healthConditions.map((condition) => (
                  <TouchableOpacity
                    key={condition.id}
                    style={[s.conditionCard, selectedConditions.includes(condition.id) && s.conditionSelected]}
                    onPress={() => toggleHealthCondition(condition.id)}
                  >
                    <View style={[s.conditionIcon, { backgroundColor: `${condition.color}20` }]}>
                      <Ionicons name={condition.icon as any} size={18} color={condition.color} />
                    </View>
                    <Text style={[s.conditionText, selectedConditions.includes(condition.id) && s.conditionTextActive]}>
                      {condition.name}
                    </Text>
                    {selectedConditions.includes(condition.id) && (
                      <View style={s.checkmark}>
                        <Ionicons name="checkmark" size={12} color="white" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <View style={s.inputContainer}>
                <View style={s.inputWrapper}>
                  <Ionicons name="add-outline" size={20} color="#4ECDC4" />
                  <TextInput
                    style={s.input}
                    value={otherCondition}
                    onChangeText={setOtherCondition}
                    placeholder="Other condition (optional)"
                    placeholderTextColor="#BDC3C7"
                  />
                </View>
              </View>
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              style={[s.continueBtn, loading && s.continueBtnDisabled]}
              onPress={handleContinue}
              disabled={loading}
            >
              <LinearGradient colors={["#9C27B0", "#7B1FA2"]} style={s.continueBtnGradient}>
                <Text style={s.continueBtnText}>{loading ? "Setting up..." : "Complete Setup"}</Text>
                {!loading && <Ionicons name="arrow-forward" size={20} color="white" />}
              </LinearGradient>
            </TouchableOpacity>

            <View style={s.bottomSpace} />
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1 },
  bg: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  header: { padding: 20, alignItems: "center" },
  title: { fontSize: 28, fontWeight: "bold", color: "#2C3E50", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#7F8C8D", textAlign: "center", marginBottom: 20 },
  progressContainer: { width: "100%" },
  progressBg: { height: 6, backgroundColor: "#E8EAF6", borderRadius: 3, marginBottom: 8 },
  progressFill: { height: "100%", backgroundColor: "#9C27B0", borderRadius: 3 },
  progressText: { fontSize: 14, color: "#9C27B0", fontWeight: "600", textAlign: "center" },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  cardTitle: { fontSize: 20, fontWeight: "bold", color: "#2C3E50", marginLeft: 12 },
  cardDesc: { fontSize: 14, color: "#7F8C8D", marginBottom: 20, lineHeight: 20 },
  inputContainer: { marginBottom: 10 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: "#F8F9FA",
    minHeight: 50,
  },
  input: { flex: 1, paddingVertical: 12, paddingLeft: 10, fontSize: 16, color: "#2C3E50" },
  hint: { fontSize: 12, color: "#7F8C8D", marginTop: 6, fontStyle: "italic" },
  radioContainer: { gap: 12 },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#F8F9FA",
  },
  radioSelected: { borderColor: "#9C27B0", backgroundColor: "#F3E5F5" },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#BDC3C7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  radioCircleActive: { borderColor: "#9C27B0" },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#9C27B0" },
  radioText: { fontSize: 16, fontWeight: "600", color: "#2C3E50", marginBottom: 2 },
  radioTextActive: { color: "#9C27B0" },
  radioSub: { fontSize: 14, color: "#7F8C8D" },
  conditionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  conditionCard: {
    width: (width - 80) / 2,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#F8F9FA",
    alignItems: "center",
    position: "relative",
    minHeight: 80,
    justifyContent: "center",
  },
  conditionSelected: { borderColor: "#4ECDC4", backgroundColor: "#E0F7FA" },
  conditionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  conditionText: { fontSize: 13, fontWeight: "600", color: "#2C3E50", textAlign: "center" },
  conditionTextActive: { color: "#4ECDC4" },
  checkmark: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#4ECDC4",
    justifyContent: "center",
    alignItems: "center",
  },
  continueBtn: {
    borderRadius: 15,
    marginHorizontal: 20,
    shadowColor: "#9C27B0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  continueBtnDisabled: { opacity: 0.7 },
  continueBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 15,
  },
  continueBtnText: { fontSize: 16, fontWeight: "bold", color: "white", marginRight: 8 },
  bottomSpace: { height: 20 },
})
