"use client"

import AsyncStorage from "@react-native-async-storage/async-storage"
import type React from "react"

import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import {
    Alert,
    Animated,
    Dimensions,
    Image,
    KeyboardAvoidingView,
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

const { width, height } = Dimensions.get("window")

interface ProfileData {
  firstName: string
  lastName: string
  email: string
  phone: string
  dueDate: string
  lastMenstrualPeriod: string
  emergencyContact: string
  doctorName: string
  hospitalName: string
  imageUri: string | null
}

const EditProfile = () => {
  const router = useRouter()

  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dueDate: "",
    lastMenstrualPeriod: "",
    emergencyContact: "",
    doctorName: "",
    hospitalName: "",
    imageUri: null,
  })

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [loading, setSaving] = useState(false)

  // Focus states for better UX
  const [focusedField, setFocusedField] = useState<string | null>(null)

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const imageScaleAnim = useRef(new Animated.Value(0.9)).current
  const cardAnimations = useRef(Array.from({ length: 4 }, () => new Animated.Value(0))).current
  const bubbleAnim1 = useRef(new Animated.Value(0)).current
  const bubbleAnim2 = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("token")
        const userId = await AsyncStorage.getItem("userId")
        if (!token || !userId) return

        const response = await fetch(`https://pregwell-backend.onrender.com/api/patients/profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) return
        const data = await response.json()
        setProfileData((prev) => ({
          ...prev,
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          email: data.email || "",
          phone: data.phone || "",
          dueDate: data.due_date || "",
          lastMenstrualPeriod: data.last_menstrual_period || "",
          emergencyContact: data.emergency_contact || "",
          doctorName: data.doctor_name || "",
          hospitalName: data.hospital_name || "",
          imageUri: data.profile_picture || null,
        }))
      } catch (e) {
        // fail silently
      }
    }
    fetchProfile()
    startAnimations()
  }, [])

  const startAnimations = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start()

    Animated.spring(imageScaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start()

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
    }).start()

    cardAnimations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 600,
        delay: 300 + index * 150,
        useNativeDriver: true,
      }).start()
    })

    startBubbleAnimations()
  }

  const startBubbleAnimations = () => {
    const createBubbleAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: 4000,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]),
      )
    }

    createBubbleAnimation(bubbleAnim1, 0).start()
    createBubbleAnimation(bubbleAnim2, 2000).start()
  }

  const pickImage = async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Sorry, we need camera roll permissions to change your profile picture.")
        return
      }
    }

    Alert.alert("Select Image", "Choose an option", [
      { text: "Camera", onPress: openCamera },
      { text: "Gallery", onPress: openGallery },
      { text: "Cancel", style: "cancel" },
    ])
  }

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Sorry, we need camera permissions to take a photo.")
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    })

    if (!result.canceled) {
      setProfileData((prev) => ({ ...prev, imageUri: result.assets[0].uri }))
    }
  }

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    })

    if (!result.canceled) {
      setProfileData((prev) => ({ ...prev, imageUri: result.assets[0].uri }))
    }
  }

  const formatDateInput = (text: string, field: string) => {
    // Remove all non-numeric characters
    const cleaned = text.replace(/\D/g, "")

    // Format as YYYY-MM-DD
    if (cleaned.length <= 4) {
      return cleaned
    } else if (cleaned.length <= 6) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`
    } else {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}`
    }
  }

  const validatePasswords = () => {
    if (newPassword.length < 6) {
      Alert.alert("Invalid Password", "Password must be at least 6 characters long.")
      return false
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Password Mismatch", "New password and confirmation don't match.")
      return false
    }
    return true
  }

  // Update user profile in DB
  const handleSave = async () => {
    setSaving(true)

    // Validate password if changing
    if (showPasswordSection && (currentPassword || newPassword || confirmPassword)) {
      if (!currentPassword) {
        Alert.alert("Missing Current Password", "Please enter your current password.")
        setSaving(false)
        return
      }
      if (!validatePasswords()) {
        setSaving(false)
        return
      }
    }

    try {
      const token = await AsyncStorage.getItem("token")
      const userId = await AsyncStorage.getItem("userId")
      if (!token || !userId) throw new Error("Not authenticated")

      // Only allow editing of name, email, phone, etc. Not dueDate
      const updatePayload = {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone,
        emergency_contact: profileData.emergencyContact,
        doctor_name: profileData.doctorName,
        hospital_name: profileData.hospitalName,
        // Do not send dueDate for editing
      }

      const response = await fetch(`https://pregwell-backend.onrender.com/api/patients/profile/${userId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatePayload),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      setSaving(false)
      Alert.alert("Success", "Your profile has been updated successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ])
    } catch (e) {
      setSaving(false)
      Alert.alert("Error", "Failed to update profile. Please try again.")
    }
  }

  const updateProfileField = (field: keyof ProfileData, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  const renderAnimatedCard = (index: number, children: React.ReactNode) => (
    <Animated.View
      style={[
        styles.animatedCard,
        {
          opacity: cardAnimations[index],
          transform: [
            {
              translateY: cardAnimations[index].interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  )

  const renderProfileImage = () => (
    <Animated.View
      style={[
        styles.imageSection,
        {
          opacity: fadeAnim,
          transform: [{ scale: imageScaleAnim }],
        },
      ]}
    >
      <TouchableOpacity onPress={pickImage} style={styles.imageContainer} activeOpacity={0.8}>
        {profileData.imageUri ? (
          <Image source={{ uri: profileData.imageUri }} style={styles.profileImage} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="person" size={60} color="#9C27B0" />
          </View>
        )}
        <View style={styles.cameraButton}>
          <LinearGradient colors={["#9C27B0", "#7B1FA2"]} style={styles.cameraGradient}>
            <Ionicons name="camera" size={20} color="white" />
          </LinearGradient>
        </View>
      </TouchableOpacity>
      <Text style={styles.imageHint}>Tap to change profile picture</Text>
    </Animated.View>
  )

  const renderPersonalInfo = () =>
    renderAnimatedCard(
      0,
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="person-outline" size={24} color="#9C27B0" />
          <Text style={styles.cardTitle}>Personal Information</Text>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>First Name</Text>
            <TextInput
              style={[styles.input, focusedField === "firstName" && styles.inputFocused]}
              value={profileData.firstName}
              onChangeText={(text) => updateProfileField("firstName", text)}
              onFocus={() => setFocusedField("firstName")}
              onBlur={() => setFocusedField(null)}
              placeholder="First Name"
              placeholderTextColor="#BDC3C7"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Last Name</Text>
            <TextInput
              style={[styles.input, focusedField === "lastName" && styles.inputFocused]}
              value={profileData.lastName}
              onChangeText={(text) => updateProfileField("lastName", text)}
              onFocus={() => setFocusedField("lastName")}
              onBlur={() => setFocusedField(null)}
              placeholder="Last Name"
              placeholderTextColor="#BDC3C7"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <View style={[styles.inputWrapper, focusedField === "email" && styles.inputWrapperFocused]}>
            <Ionicons name="mail-outline" size={20} color={focusedField === "email" ? "#9C27B0" : "#BDC3C7"} />
            <TextInput
              style={styles.inputWithIcon}
              value={profileData.email}
              onChangeText={(text) => updateProfileField("email", text)}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              placeholder="Email Address"
              placeholderTextColor="#BDC3C7"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Phone Number</Text>
          <View style={[styles.inputWrapper, focusedField === "phone" && styles.inputWrapperFocused]}>
            <Ionicons name="call-outline" size={20} color={focusedField === "phone" ? "#9C27B0" : "#BDC3C7"} />
            <TextInput
              style={styles.inputWithIcon}
              value={profileData.phone}
              onChangeText={(text) => updateProfileField("phone", text)}
              onFocus={() => setFocusedField("phone")}
              onBlur={() => setFocusedField(null)}
              placeholder="Phone Number"
              placeholderTextColor="#BDC3C7"
              keyboardType="phone-pad"
            />
          </View>
        </View>
      </View>,
    )

  const renderPregnancyInfo = () =>
    renderAnimatedCard(
      1,
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="heart-outline" size={24} color="#FF6B9D" />
          <Text style={styles.cardTitle}>Pregnancy Information</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Last Menstrual Period (LMP)</Text>
          <View style={[styles.inputWrapper, focusedField === "lmp" && styles.inputWrapperFocused]}>
            <Ionicons name="calendar-outline" size={20} color={focusedField === "lmp" ? "#FF6B9D" : "#BDC3C7"} />
            <TextInput
              style={styles.inputWithIcon}
              value={profileData.lastMenstrualPeriod}
              onChangeText={(text) => updateProfileField("lastMenstrualPeriod", formatDateInput(text, "lmp"))}
              onFocus={() => setFocusedField("lmp")}
              onBlur={() => setFocusedField(null)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#BDC3C7"
              keyboardType="numeric"
              maxLength={10}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Expected Due Date</Text>
          <View style={[styles.inputWrapper, focusedField === "dueDate" && styles.inputWrapperFocused]}>
            <Ionicons name="calendar-outline" size={20} color={focusedField === "dueDate" ? "#FF6B9D" : "#BDC3C7"} />
            <TextInput
              style={[styles.inputWithIcon, { color: "#888" }]}
              value={profileData.dueDate}
              editable={false}
              selectTextOnFocus={false}
              placeholder="MM/DD/YYYY"
              placeholderTextColor="#BDC3C7"
            />
          </View>
        </View>
      </View>,
    )

  const renderMedicalInfo = () =>
    renderAnimatedCard(
      2,
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="medical-outline" size={24} color="#4ECDC4" />
          <Text style={styles.cardTitle}>Medical Information</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Doctor's Name</Text>
          <View style={[styles.inputWrapper, focusedField === "doctor" && styles.inputWrapperFocused]}>
            <Ionicons name="person-outline" size={20} color={focusedField === "doctor" ? "#4ECDC4" : "#BDC3C7"} />
            <TextInput
              style={styles.inputWithIcon}
              value={profileData.doctorName}
              onChangeText={(text) => updateProfileField("doctorName", text)}
              onFocus={() => setFocusedField("doctor")}
              onBlur={() => setFocusedField(null)}
              placeholder="Doctor's Name"
              placeholderTextColor="#BDC3C7"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Hospital/Clinic</Text>
          <View style={[styles.inputWrapper, focusedField === "hospital" && styles.inputWrapperFocused]}>
            <Ionicons name="business-outline" size={20} color={focusedField === "hospital" ? "#4ECDC4" : "#BDC3C7"} />
            <TextInput
              style={styles.inputWithIcon}
              value={profileData.hospitalName}
              onChangeText={(text) => updateProfileField("hospitalName", text)}
              onFocus={() => setFocusedField("hospital")}
              onBlur={() => setFocusedField(null)}
              placeholder="Hospital or Clinic Name"
              placeholderTextColor="#BDC3C7"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Emergency Contact</Text>
          <View style={[styles.inputWrapper, focusedField === "emergency" && styles.inputWrapperFocused]}>
            <Ionicons name="call-outline" size={20} color={focusedField === "emergency" ? "#4ECDC4" : "#BDC3C7"} />
            <TextInput
              style={styles.inputWithIcon}
              value={profileData.emergencyContact}
              onChangeText={(text) => updateProfileField("emergencyContact", text)}
              onFocus={() => setFocusedField("emergency")}
              onBlur={() => setFocusedField(null)}
              placeholder="Emergency Contact Number"
              placeholderTextColor="#BDC3C7"
              keyboardType="phone-pad"
            />
          </View>
        </View>
      </View>,
    )

  const renderPasswordSection = () =>
    renderAnimatedCard(
      3,
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => setShowPasswordSection(!showPasswordSection)}
          activeOpacity={0.7}
        >
          <Ionicons name="lock-closed-outline" size={24} color="#FFA726" />
          <Text style={styles.cardTitle}>Change Password</Text>
          <Ionicons
            name={showPasswordSection ? "chevron-up" : "chevron-down"}
            size={20}
            color="#FFA726"
            style={styles.expandIcon}
          />
        </TouchableOpacity>

        {showPasswordSection && (
          <View style={styles.passwordContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <View style={[styles.inputWrapper, focusedField === "currentPassword" && styles.inputWrapperFocused]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={focusedField === "currentPassword" ? "#FFA726" : "#BDC3C7"}
                />
                <TextInput
                  style={styles.inputWithIcon}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  onFocus={() => setFocusedField("currentPassword")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Enter current password"
                  placeholderTextColor="#BDC3C7"
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={[styles.inputWrapper, focusedField === "newPassword" && styles.inputWrapperFocused]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={focusedField === "newPassword" ? "#FFA726" : "#BDC3C7"}
                />
                <TextInput
                  style={styles.inputWithIcon}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  onFocus={() => setFocusedField("newPassword")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Enter new password"
                  placeholderTextColor="#BDC3C7"
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <View style={[styles.inputWrapper, focusedField === "confirmPassword" && styles.inputWrapperFocused]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={focusedField === "confirmPassword" ? "#FFA726" : "#BDC3C7"}
                />
                <TextInput
                  style={styles.inputWithIcon}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onFocus={() => setFocusedField("confirmPassword")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Confirm new password"
                  placeholderTextColor="#BDC3C7"
                  secureTextEntry
                />
              </View>
            </View>

            <Text style={styles.passwordHint}>Password must be at least 6 characters long</Text>
          </View>
        )}
      </View>,
    )

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={["#F3E5F5", "#E1BEE7", "#CE93D8"]} style={styles.backgroundGradient}>
          {/* Animated Background Bubbles */}
          <Animated.View
            style={[
              styles.bubble,
              styles.bubbleTop,
              {
                opacity: bubbleAnim1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.05, 0.15],
                }),
                transform: [
                  {
                    scale: bubbleAnim1.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.2],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.bubble,
              styles.bubbleBottom,
              {
                opacity: bubbleAnim2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.05, 0.1],
                }),
                transform: [
                  {
                    scale: bubbleAnim2.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1.1],
                    }),
                  },
                ],
              },
            ]}
          />

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <View style={styles.headerSpacer} />
          </View>

          <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Animated.View
                style={[
                  styles.content,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                {renderProfileImage()}
                {renderPersonalInfo()}
                {renderPregnancyInfo()}
                {renderMedicalInfo()}
                {renderPasswordSection()}

                {/* Save Button */}
                <Animated.View
                  style={[
                    styles.saveButtonContainer,
                    {
                      opacity: fadeAnim,
                      transform: [{ translateY: slideAnim }],
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    <LinearGradient colors={["#9C27B0", "#7B1FA2"]} style={styles.saveButtonGradient}>
                      {loading ? (
                        <Text style={styles.saveButtonText}>Saving...</Text>
                      ) : (
                        <>
                          <Ionicons name="save-outline" size={20} color="white" />
                          <Text style={styles.saveButtonText}>Save Changes</Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>

                <View style={styles.bottomSpacing} />
              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
  },
  bubble: {
    position: "absolute",
    borderRadius: 100,
    backgroundColor: "rgba(156, 39, 176, 0.1)",
  },
  bubbleTop: {
    width: 200,
    height: 200,
    top: -50,
    right: -50,
  },
  bubbleBottom: {
    width: 150,
    height: 150,
    bottom: 100,
    left: -75,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black", // changed from white to black
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  content: {
    flex: 1,
  },
  imageSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "white",
    shadowColor: "#9C27B0",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  placeholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "white",
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#9C27B0",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    borderRadius: 20,
    shadowColor: "#9C27B0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cameraGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
  },
  imageHint: {
    fontSize: 14,
    color: "#7F8C8D",
    textAlign: "center",
  },
  animatedCard: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginLeft: 10,
    flex: 1,
  },
  expandIcon: {
    marginLeft: 10,
  },
  inputRow: {
    flexDirection: "row",
    gap: 15,
  },
  inputContainer: {
    marginBottom: 15,
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: "#2C3E50",
    backgroundColor: "white",
  },
  inputFocused: {
    borderColor: "#9C27B0",
    shadowColor: "#9C27B0",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: "white",
  },
  inputWrapperFocused: {
    borderColor: "#9C27B0",
    shadowColor: "#9C27B0",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputWithIcon: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 10,
    fontSize: 16,
    color: "#2C3E50",
  },
  passwordContent: {
    marginTop: 10,
  },
  passwordHint: {
    fontSize: 12,
    color: "#7F8C8D",
    marginTop: 5,
    fontStyle: "italic",
  },
  saveButtonContainer: {
    marginTop: 20,
  },
  saveButton: {
    borderRadius: 15,
    shadowColor: "#9C27B0",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 15,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 30,
  },
})

export default EditProfile
