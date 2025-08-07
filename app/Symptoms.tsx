"use client"

import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native"

const { width, height } = Dimensions.get("window")

interface Symptom {
  id: number
  name: string
  icon: string
  color: string
  lightColor: string
  description: string
}

interface CustomSymptom {
  id: string
  name: string
}

const symptoms: Symptom[] = [
  {
    id: 1,
    name: "Nausea",
    icon: "medical-outline",
    color: "#4CAF50",
    lightColor: "#E8F5E8",
    description: "Morning sickness",
  },
  {
    id: 2,
    name: "Headache",
    icon: "fitness-outline",
    color: "#FF9800",
    lightColor: "#FFF3E0",
    description: "Head pain or tension",
  },
  {
    id: 3,
    name: "Fatigue",
    icon: "bed-outline",
    color: "#3F51B5",
    lightColor: "#E8EAF6",
    description: "Feeling tired or exhausted",
  },
  {
    id: 4,
    name: "Back Pain",
    icon: "body-outline",
    color: "#E91E63",
    lightColor: "#FCE4EC",
    description: "Back discomfort",
  },
  {
    id: 5,
    name: "Swelling",
    icon: "water-outline",
    color: "#2196F3",
    lightColor: "#E3F2FD",
    description: "Swelling in hands, feet, or face",
  },
  {
    id: 6,
    name: "Dizziness",
    icon: "sync-outline",
    color: "#9C27B0",
    lightColor: "#F3E5F5",
    description: "Feeling lightheaded or dizzy",
  },
  {
    id: 7,
    name: "Cramps",
    icon: "pulse-outline",
    color: "#FF5722",
    lightColor: "#FBE9E7",
    description: "Muscle cramps ",
  },
  {
    id: 8,
    name: "Insomnia",
    icon: "moon-outline",
    color: "#607D8B",
    lightColor: "#ECEFF1",
    description: "Difficulty sleeping",
  },
  {
    id: 9,
    name: "Heartburn",
    icon: "flame-outline",
    color: "#FF6B9D",
    lightColor: "#FCE4EC",
    description: "Acid reflux or burning sensation",
  },
  {
    id: 10,
    name: "Mood Swings",
    icon: "happy-outline",
    color: "#FFC107",
    lightColor: "#FFFDE7",
    description: "Emotional changes or mood fluctuations",
  },
]

function getInitials(name: string) {
  if (!name) return ""
  const parts = name.trim().split(" ")
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function SymptomsScreen() {
  const router = useRouter()
  const [selectedSymptoms, setSelectedSymptoms] = useState<number[]>([])
  const [customSymptoms, setCustomSymptoms] = useState<CustomSymptom[]>([])
  const [newSymptom, setNewSymptom] = useState<string>("")
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [keyboardVisible, setKeyboardVisible] = useState(false)

  // Add user data and pregnancy data state
  const [userData, setUserData] = useState<{ firstName: string; lastMenstrualPeriod: string; profilePicture?: string } | null>(null)
  const [pregnancyInfo, setPregnancyInfo] = useState<{ week: number; trimester: string } | null>(null)

  // Minimal animation values - only for essential UI feedback
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scrollViewRef = useRef<ScrollView>(null)
  const textInputRef = useRef<TextInput>(null)

  useEffect(() => {
    // Simple fade in animation only
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()

    // Keyboard listeners
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", handleKeyboardShow)
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", handleKeyboardHide)

    return () => {
      keyboardDidShowListener?.remove()
      keyboardDidHideListener?.remove()
    }
  }, [])

  useEffect(() => {
    // Fetch user data on mount
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("token")
        const userId = await AsyncStorage.getItem("userId")
        if (!token || !userId) return

        const response = await fetch(`https://pregwell-backend.onrender.com/api/patients/profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) return
        const data = await response.json()
        setUserData({
          firstName: data.first_name,
          lastMenstrualPeriod: data.last_menstrual_period,
          profilePicture: data.profile_picture, //  this line returns a URL to the profile picture
        })

        // Calculate pregnancy week and trimester
        if (data.last_menstrual_period) {
          const lmpDate = new Date(data.last_menstrual_period)
          const today = new Date()
          const days = Math.floor((today.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24))
          const week = Math.floor(days / 7)
          let trimester = "1st Trimester"
          if (week > 27) trimester = "3rd Trimester"
          else if (week > 12) trimester = "2nd Trimester"
          setPregnancyInfo({ week, trimester })
        }
      } catch (e) {
        // fail silently
      }
    }
    fetchUserData()
  }, [])

  const handleKeyboardShow = () => {
    setKeyboardVisible(true)
    // Scroll to custom symptoms section when keyboard appears
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }, 100)
  }

  const handleKeyboardHide = () => {
    setKeyboardVisible(false)
  }

  const dismissKeyboard = () => {
    Keyboard.dismiss()
    textInputRef.current?.blur()
  }

  const toggleSymptom = (id: number) => {
    if (selectedSymptoms.includes(id)) {
      setSelectedSymptoms(selectedSymptoms.filter((symptomId) => symptomId !== id))
    } else {
      setSelectedSymptoms([...selectedSymptoms, id])
    }
  }

  const addCustomSymptom = () => {
    if (newSymptom.trim() === "") return

    const customId = `custom-${Date.now()}`
    const newCustomSymptom: CustomSymptom = {
      id: customId,
      name: newSymptom.trim(),
    }

    setCustomSymptoms([...customSymptoms, newCustomSymptom])
    setNewSymptom("")

    // Dismiss keyboard after adding
    dismissKeyboard()

    // Show success feedback
    Alert.alert("Added!", `"${newCustomSymptom.name}" has been added to your symptoms.`)
  }

  const removeCustomSymptom = (id: string) => {
    const symptomToRemove = customSymptoms.find((s) => s.id === id)
    setCustomSymptoms(customSymptoms.filter((symptom) => symptom.id !== id))

    if (symptomToRemove) {
      Alert.alert("Removed", `"${symptomToRemove.name}" has been removed from your symptoms.`)
    }
  }

  const handleContinue = () => {
    if (selectedSymptoms.length > 0 || customSymptoms.length > 0) {
      // Dismiss keyboard before navigation
      dismissKeyboard()

      // Convert array to comma-separated string for URL params
      const symptomsParam = selectedSymptoms.join(",")

      // Convert custom symptoms to JSON string
      const customSymptomsParam = JSON.stringify(customSymptoms)

      router.push({
        pathname: "/Advice",
        params: {
          symptoms: symptomsParam,
          customSymptoms: customSymptomsParam,
          trimester: pregnancyInfo?.trimester, // <-- add this
        },
      })
    }
  }

  const handleBack = () => {
    dismissKeyboard()
    router.back()
  }

  const isButtonDisabled = selectedSymptoms.length === 0 && customSymptoms.length === 0

  const renderSymptomCard = (symptom: Symptom) => (
    <TouchableOpacity
      key={symptom.id}
      style={[
        styles.symptomCard,
        selectedSymptoms.includes(symptom.id) && [
          styles.selectedSymptom,
          { backgroundColor: symptom.color, borderColor: symptom.color },
        ],
      ]}
      onPress={() => toggleSymptom(symptom.id)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={
          selectedSymptoms.includes(symptom.id)
            ? [symptom.color, `${symptom.color}CC`]
            : [symptom.lightColor, "#FFFFFF"]
        }
        style={styles.symptomCardGradient}
      >
        <View
          style={[
            styles.symptomIconContainer,
            {
              backgroundColor: selectedSymptoms.includes(symptom.id) ? "rgba(255,255,255,0.2)" : symptom.lightColor,
            },
          ]}
        >
          <Ionicons
            name={symptom.icon as any}
            size={28}
            color={selectedSymptoms.includes(symptom.id) ? "#fff" : symptom.color}
          />
        </View>
        <Text style={[styles.symptomText, selectedSymptoms.includes(symptom.id) && styles.selectedSymptomText]}>
          {symptom.name}
        </Text>
        <Text
          style={[
            styles.symptomDescription,
            selectedSymptoms.includes(symptom.id) && styles.selectedSymptomDescription,
          ]}
        >
          {symptom.description}
        </Text>
        {selectedSymptoms.includes(symptom.id) && (
          <View style={styles.checkmarkContainer}>
            <Ionicons name="checkmark-circle" size={24} color="white" />
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  )

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={{ flex: 1 }}>
          <LinearGradient colors={["#E8EAF6", "#F3E5F5", "#FCE4EC"]} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
              {/* Header */}
              <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
                  <LinearGradient
                    colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0.1)"]}
                    style={styles.backButtonGradient}
                  >
                    <Ionicons name="chevron-back" size={24} color="#9C27B0" />
                  </LinearGradient>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Pregnancy Symptoms</Text>
                <View style={styles.placeholder} />
              </Animated.View>

              {/* Profile Section - Hide when keyboard is visible */}
              {!keyboardVisible && (
                <Animated.View style={[styles.profileSection, { opacity: fadeAnim }]}>
                  <View style={styles.profileImageContainer}>
                    {userData?.profilePicture ? (
                      <Image source={{ uri: userData.profilePicture }} style={styles.profileImage} />
                    ) : (
                      <View
                        style={[
                          styles.profileImage,
                          { backgroundColor: "#E1BEE7", justifyContent: "center", alignItems: "center" },
                        ]}
                      >
                        <Text style={{ fontSize: 28, color: "#9C27B0", fontWeight: "bold" }}>
                          {getInitials(userData?.firstName || "U")}
                        </Text>
                      </View>
                    )}
                    <View style={styles.profileImageBorder} />
                  </View>
                  <View style={styles.profileInfo}>
                    <Text style={styles.welcomeText}>Hello, how are you feeling?</Text>
                    <Text style={styles.nameText}>
                      {userData?.firstName ? userData.firstName : "User"}
                    </Text>
                    {pregnancyInfo && (
                      <View style={styles.weekContainer}>
                        <Ionicons name="calendar-outline" size={16} color="#9C27B0" />
                        <Text style={styles.weekText}>
                          Week {pregnancyInfo.week} • {pregnancyInfo.trimester}
                        </Text>
                      </View>
                    )}
                  </View>
                </Animated.View>
              )}

              {/* Content Container */}
              <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
              >
                <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
                  <View style={styles.titleContainer}>
                    <Text style={styles.title}>What symptoms are you experiencing?</Text>
                    <Text style={styles.subtitle}>Select all that apply to get personalized advice</Text>
                  </View>

                  <ScrollView
                    ref={scrollViewRef}
                    style={styles.symptomsContainer}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.scrollContent}
                  >
                    <View style={styles.symptomsGrid}>{symptoms.map((symptom) => renderSymptomCard(symptom))}</View>

                    {/* Custom Symptoms Section */}
                    <View style={styles.customSymptomsSection}>
                      <LinearGradient colors={["#F3E5F5", "#FFFFFF"]} style={styles.customSymptomsGradient}>
                        <View style={styles.customSymptomsHeader}>
                          <Ionicons name="add-circle-outline" size={24} color="#9C27B0" />
                          <View style={styles.customSymptomsHeaderText}>
                            <Text style={styles.customSymptomsTitle}>Don't see your symptom?</Text>
                            <Text style={styles.customSymptomsSubtitle}>Add your own symptoms below</Text>
                          </View>
                        </View>

                        <View style={styles.customSymptomInputContainer}>
                          <View style={[styles.inputWrapper, isInputFocused && styles.inputWrapperFocused]}>
                            <Ionicons
                              name="create-outline"
                              size={20}
                              color={isInputFocused ? "#9C27B0" : "#BDC3C7"}
                              style={styles.inputIcon}
                            />
                            <TextInput
                              ref={textInputRef}
                              style={styles.customSymptomInput}
                              placeholder="Enter your symptom..."
                              value={newSymptom}
                              onChangeText={setNewSymptom}
                              onFocus={() => setIsInputFocused(true)}
                              onBlur={() => setIsInputFocused(false)}
                              placeholderTextColor="#9e9e9e"
                              returnKeyType="done"
                              onSubmitEditing={addCustomSymptom}
                              blurOnSubmit={true}
                            />
                          </View>
                          <TouchableOpacity
                            style={[
                              styles.addSymptomButton,
                              newSymptom.trim() === "" && styles.addSymptomButtonDisabled,
                            ]}
                            onPress={addCustomSymptom}
                            disabled={newSymptom.trim() === ""}
                            activeOpacity={0.8}
                          >
                            <LinearGradient colors={["#9C27B0", "#7B1FA2"]} style={styles.addSymptomButtonGradient}>
                              <Ionicons name="add" size={24} color="#fff" />
                            </LinearGradient>
                          </TouchableOpacity>
                        </View>

                        {/* Display Custom Symptoms */}
                        {customSymptoms.length > 0 && (
                          <View style={styles.customSymptomsList}>
                            <Text style={styles.customSymptomsListTitle}>Your custom symptoms:</Text>
                            {customSymptoms.map((symptom) => (
                              <View key={symptom.id} style={styles.customSymptomItem}>
                                <View style={styles.customSymptomBadge}>
                                  <View style={styles.customSymptomIconContainer}>
                                    <Ionicons name="add-circle" size={18} color="#9C27B0" />
                                  </View>
                                  <Text style={styles.customSymptomName}>{symptom.name}</Text>
                                </View>
                                <TouchableOpacity
                                  onPress={() => removeCustomSymptom(symptom.id)}
                                  style={styles.removeSymptomButton}
                                  activeOpacity={0.7}
                                >
                                  <Ionicons name="close-circle" size={22} color="#FF5722" />
                                </TouchableOpacity>
                              </View>
                            ))}
                          </View>
                        )}
                      </LinearGradient>
                    </View>

                    {/* Extra space for keyboard */}
                    <View style={styles.bottomSpacing} />
                  </ScrollView>

                  {/* Continue Button - Fixed at bottom */}
                  <View style={styles.continueButtonContainer}>
                    <TouchableOpacity
                      style={[styles.continueButton, isButtonDisabled && styles.disabledButton]}
                      onPress={handleContinue}
                      disabled={isButtonDisabled}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={isButtonDisabled ? ["#E1BEE7", "#E1BEE7"] : ["#9C27B0", "#7B1FA2"]}
                        style={styles.continueButtonGradient}
                      >
                        <Text style={[styles.continueButtonText, isButtonDisabled && styles.disabledButtonText]}>
                          Get Personalized Advice
                        </Text>
                        <Ionicons
                          name="arrow-forward"
                          size={20}
                          color={isButtonDisabled ? "#BDC3C7" : "#fff"}
                          style={styles.continueButtonIcon}
                        />
                      </LinearGradient>
                    </TouchableOpacity>

                    {/* Selected Count */}
                    {(selectedSymptoms.length > 0 || customSymptoms.length > 0) && (
                      <View style={styles.selectedCountContainer}>
                        <Text style={styles.selectedCountText}>
                          {selectedSymptoms.length + customSymptoms.length} symptom
                          {selectedSymptoms.length + customSymptoms.length !== 1 ? "s" : ""} selected
                        </Text>
                      </View>
                    )}
                  </View>
                </Animated.View>
              </KeyboardAvoidingView>
            </SafeAreaView>
          </LinearGradient>
        </View>
      </TouchableWithoutFeedback>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 50 : 70,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    borderRadius: 20,
    shadowColor: "#9C27B0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  backButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2C3E50",
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  profileImageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  profileImageBorder: {
    position: "absolute",
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: "#E1BEE7",
  },
  profileInfo: {
    marginLeft: 20,
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: "#7F8C8D",
    marginBottom: 4,
  },
  nameText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 6,
  },
  weekContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(156, 39, 176, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: "flex-start",
  },
  weekText: {
    fontSize: 14,
    color: "#9C27B0",
    fontWeight: "600",
    marginLeft: 6,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
    marginBottom: 25,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 8,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 16,
    color: "#7F8C8D",
    lineHeight: 22,
  },
  symptomsContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  symptomsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  symptomCard: {
    width: "48%",
    marginBottom: 15,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: "transparent",
  },
  symptomCardGradient: {
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    minHeight: 140,
    justifyContent: "space-between",
  },
  selectedSymptom: {
    shadowColor: "#9C27B0",
    shadowOpacity: 0.3,
    elevation: 8,
  },
  symptomIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  symptomText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 6,
  },
  selectedSymptomText: {
    color: "#ffffff",
  },
  symptomDescription: {
    fontSize: 12,
    color: "#7F8C8D",
    textAlign: "center",
    lineHeight: 16,
  },
  selectedSymptomDescription: {
    color: "rgba(255, 255, 255, 0.9)",
  },
  checkmarkContainer: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  customSymptomsSection: {
    marginBottom: 30,
  },
  customSymptomsGradient: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  customSymptomsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  customSymptomsHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  customSymptomsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 4,
  },
  customSymptomsSubtitle: {
    fontSize: 14,
    color: "#7F8C8D",
  },
  customSymptomInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 15,
    paddingHorizontal: 15,
    borderWidth: 2,
    borderColor: "transparent",
    minHeight: 50,
  },
  inputWrapperFocused: {
    borderColor: "#9C27B0",
    backgroundColor: "#ffffff",
    shadowColor: "#9C27B0",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  customSymptomInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: "#2C3E50",
  },
  addSymptomButton: {
    marginLeft: 12,
    borderRadius: 15,
    shadowColor: "#9C27B0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addSymptomButtonDisabled: {
    shadowOpacity: 0.1,
    elevation: 2,
  },
  addSymptomButtonGradient: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  customSymptomsList: {
    marginTop: 10,
  },
  customSymptomsListTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 12,
  },
  customSymptomItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E1BEE7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  customSymptomBadge: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  customSymptomIconContainer: {
    marginRight: 12,
  },
  customSymptomName: {
    fontSize: 16,
    color: "#2C3E50",
    fontWeight: "500",
  },
  removeSymptomButton: {
    padding: 5,
  },
  bottomSpacing: {
    height: 100,
  },
  continueButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
    paddingTop: 10,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  continueButton: {
    borderRadius: 15,
    shadowColor: "#9C27B0",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 15,
  },
  disabledButton: {
    shadowOpacity: 0.1,
    elevation: 2,
  },
  continueButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButtonText: {
    color: "#BDC3C7",
  },
  continueButtonIcon: {
    marginLeft: 8,
  },
  selectedCountContainer: {
    alignItems: "center",
    marginTop: 12,
  },
  selectedCountText: {
    fontSize: 14,
    color: "#9C27B0",
    fontWeight: "600",
  },
})
