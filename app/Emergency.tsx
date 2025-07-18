"use client"

import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { LinearGradient } from "expo-linear-gradient"
import * as Location from "expo-location"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import {
    ActivityIndicator,
    Alert,
    Linking,
    SafeAreaView,
    ScrollView, Share, StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native"

const quickActions = [
  { id: "1", title: "Call 911", icon: "call", color: "#F44336", action: "emergency" },
  { id: "2", title: "Find Hospital", icon: "location", color: "#4CAF50", action: "hospital" },
  { id: "3", title: "Share Location", icon: "share", color: "#9C27B0", action: "location" },
]

export default function EmergencyScreen() {
  const router = useRouter()
  const [userId, setUserId] = useState(null)
  const [selectedTab, setSelectedTab] = useState("emergency")
  const [loading, setLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [emergencyContacts, setEmergencyContacts] = useState([])
  const [name, setName] = useState("")
  const [number, setNumber] = useState("")
  const [description, setDescription] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [userLocation, setUserLocation] = useState(null)

  useEffect(() => {
    const loadUserId = async () => {
      const storedUser = await AsyncStorage.getItem("user")
      const parsed = storedUser ? JSON.parse(storedUser) : null
      if (parsed?.id) {
        setUserId(parsed.id)
      }
    }
    loadUserId()
    requestLocationPermission()
  }, [])

  useEffect(() => {
    if (userId) fetchContacts()
  }, [userId])

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status === "granted") {
        getCurrentLocation()
      } else {
        Alert.alert(
          "Location Permission",
          "Location access is needed for emergency features like finding hospitals and sharing your location.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Settings", onPress: () => Linking.openSettings() },
          ],
        )
      }
    } catch (error) {
      console.log("Location permission error:", error)
    }
  }

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      })
      setUserLocation(location.coords)
    } catch (error) {
      console.log("Get location error:", error)
    }
  }

  const fetchContacts = async () => {
    try {
      const res = await fetch(`https://pregwell-backend.onrender.com/api/emergency_contacts/${userId}`)
      const data = await res.json()
      setEmergencyContacts(data.contacts || [])
    } catch (err) {
      console.log("Error fetching contacts:", err)
    }
  }

  const handleAddContact = async () => {
    if (!name.trim() || !number.trim()) {
      Alert.alert("Missing Information", "Please enter both name and phone number.")
      return
    }

    try {
      const res = await fetch(`https://pregwell-backend.onrender.com/api/emergency_contacts/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, number, description }),
      })
      const data = await res.json()

      if (res.ok) {
        setName("")
        setNumber("")
        setDescription("")
        setShowForm(false)
        fetchContacts()
        Alert.alert("Success", "Emergency contact added successfully!")
      } else {
        Alert.alert("Failed to add contact", data.message || "Try again later.")
      }
    } catch (err) {
      console.log("Error adding contact:", err)
      Alert.alert("Failed to add contact", "Server unreachable or error occurred.")
    }
  }

  const handleDeleteContact = async (contactId, contactName) => {
    Alert.alert("Delete Contact", `Remove ${contactName}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await fetch(`https://pregwell-backend.onrender.com/api/emergency_contacts/${userId}/${contactId}`, { method: "DELETE" })
            fetchContacts()
            Alert.alert("Deleted", `${contactName} removed.`)
          } catch (err) {
            Alert.alert("Error", "Failed to delete contact.")
          }
        },
      },
    ])
  }

  const handleCall = (number) => {
    Alert.alert("Emergency Call", `Call ${number}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Call", style: "destructive", onPress: () => Linking.openURL(`tel:${number}`) },
    ])
  }

  const findNearestHospitals = async () => {
    setLoading(true)

    try {
      if (!userLocation) {
        await getCurrentLocation()
      }

      if (userLocation) {
        // Open Google Maps with hospital search near user's location
        const { latitude, longitude } = userLocation
        const googleMapsUrl = `https://www.google.com/maps/search/hospitals+near+me/@${latitude},${longitude},15z`

        // For mobile apps, use the Google Maps app URL scheme
        const mobileUrl = `https://maps.google.com/?q=hospitals&ll=${latitude},${longitude}&z=15`

        const supported = await Linking.canOpenURL(mobileUrl)
        if (supported) {
          await Linking.openURL(mobileUrl)
        } else {
          await Linking.openURL(googleMapsUrl)
        }
      } else {
        // Fallback: Open general hospital search
        const fallbackUrl = "https://www.google.com/maps/search/hospitals+near+me"
        await Linking.openURL(fallbackUrl)
      }
    } catch (error) {
      console.log("Error opening maps:", error)
      Alert.alert("Error", "Unable to open maps. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const shareLocation = async () => {
    setLocationLoading(true)

    try {
      let location = userLocation
      if (!location) {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        })
        location = currentLocation.coords
        setUserLocation(location)
      }

      if (location) {
        const { latitude, longitude } = location
        const locationMessage = `🚨 EMERGENCY LOCATION SHARE 🚨\n\nI need help! My current location is:\n\nLatitude: ${latitude.toFixed(6)}\nLongitude: ${longitude.toFixed(6)}\n\nGoogle Maps: https://maps.google.com/?q=${latitude},${longitude}\n\nPlease send help immediately!`

        // Share via React Native's built-in Share API
        try {
          await Share.share({
            message: locationMessage,
            title: "🚨 Emergency Location Share",
          })
        } catch (error) {
          console.log("Share error:", error)
          // Fallback: Show alert with options
          Alert.alert("Location Ready to Share", locationMessage, [
            {
              text: "Copy Location",
              onPress: () => {
                Alert.alert("Location Info", "Copy this message and send it via your preferred messaging app.")
              },
            },
            {
              text: "Send SMS",
              onPress: () => {
                const smsUrl = `sms:?body=${encodeURIComponent(locationMessage)}`
                Linking.openURL(smsUrl)
              },
            },
            { text: "Close", style: "cancel" },
          ])
        }

        // Also send to emergency contacts if any exist
        if (emergencyContacts.length > 0) {
          Alert.alert(
            "Send to Emergency Contacts?",
            "Would you like to send your location to your emergency contacts via SMS?",
            [
              { text: "No", style: "cancel" },
              { text: "Yes", onPress: () => sendLocationToContacts(locationMessage) },
            ],
          )
        }
      } else {
        Alert.alert("Location Error", "Unable to get your current location. Please check your location settings.")
      }
    } catch (error) {
      console.log("Error sharing location:", error)
      Alert.alert("Error", "Unable to share location. Please try again.")
    } finally {
      setLocationLoading(false)
    }
  }

  const sendLocationToContacts = (locationMessage) => {
    if (emergencyContacts.length > 0) {
      const phoneNumbers = emergencyContacts.map((contact) => contact.number).join(",")
      const smsUrl = `sms:${phoneNumbers}?body=${encodeURIComponent(locationMessage)}`
      Linking.openURL(smsUrl)
    }
  }

  const handleQuickAction = (action) => {
    const actions = {
      emergency: () => handleCall("911"),
      hospital: findNearestHospitals,
      location: shareLocation,
    }
    actions[action]()
  }

  return (
    <View style={s.container}>
      <LinearGradient colors={["#F44336", "#D32F2F"]} style={s.header}>
        <SafeAreaView>
          <View style={s.headerContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={s.headerTitle}>Emergency</Text>
            <TouchableOpacity onPress={() => handleCall("911")}>
              <Ionicons name="warning" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={s.headerSubtitle}>Quick access to emergency services</Text>
        </SafeAreaView>
      </LinearGradient>

      <View style={s.alertBanner}>
        <Ionicons name="warning" size={20} color="white" />
        <Text style={s.alertText}>If this is a life-threatening emergency, call 911 immediately</Text>
      </View>

      <View style={s.tabContainer}>
        {["emergency", "contacts"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[s.tabButton, selectedTab === tab && s.tabButtonActive]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[s.tabText, selectedTab === tab && s.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        {selectedTab === "emergency" ? (
          <>
            <Text style={s.sectionTitle}>Quick Actions</Text>
            <View style={s.quickActionsGrid}>
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={[s.quickActionCard, { backgroundColor: `${action.color}15` }]}
                  onPress={() => handleQuickAction(action.action)}
                  disabled={action.action === "location" && locationLoading}
                >
                  <View style={[s.quickActionIcon, { backgroundColor: action.color }]}>
                    {action.action === "location" && locationLoading ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Ionicons name={action.icon as any} size={28} color="white" />
                    )}
                  </View>
                  <Text style={s.quickActionTitle}>
                    {action.action === "location" && locationLoading ? "Sharing..." : action.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={s.hospitalSection}>
              <Ionicons name="location" size={32} color="#F44336" />
              <Text style={s.hospitalTitle}>Find Nearest Hospital</Text>
              <Text style={s.hospitalSubtitle}>Get directions to closest medical facility</Text>
              <TouchableOpacity style={s.findButton} onPress={findNearestHospitals} disabled={loading}>
                <LinearGradient colors={["#F44336", "#D32F2F"]} style={s.findButtonGradient}>
                  {loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Ionicons name="navigate" size={24} color="white" />
                  )}
                  <Text style={s.findButtonText}>{loading ? "Opening Maps..." : "Find Hospitals"}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <Text style={s.sectionTitle}>Location Services</Text>
            <View style={s.locationSection}>
              <View style={s.locationInfo}>
                <Ionicons name="location-outline" size={24} color="#4CAF50" />
                <View style={s.locationText}>
                  <Text style={s.locationTitle}>Location Status</Text>
                  <Text style={s.locationSubtitle}>
                    {userLocation ? "Location services active" : "Getting location..."}
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={s.shareLocationButton} onPress={shareLocation} disabled={locationLoading}>
                <LinearGradient colors={["#9C27B0", "#7B1FA2"]} style={s.shareButtonGradient}>
                  {locationLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Ionicons name="share" size={20} color="white" />
                  )}
                  <Text style={s.shareButtonText}>{locationLoading ? "Sharing..." : "Share Location"}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={s.contactsHeader}>
              <View>
                <Text style={s.sectionTitle}>Emergency Contacts</Text>
                <Text style={s.sectionSubtitle}>Manage your emergency contact list</Text>
              </View>
              <TouchableOpacity onPress={() => setShowForm(!showForm)}>
                <Ionicons name={showForm ? "close-circle" : "add-circle"} size={24} color="#9C27B0" />
              </TouchableOpacity>
            </View>

            {showForm && (
              <View style={s.formContainer}>
                <LinearGradient colors={["#F3E5F5", "#FFFFFF"]} style={s.formGradient}>
                  <Text style={s.formTitle}>Add Emergency Contact</Text>
                  <TextInput
                    placeholder="Contact Name *"
                    value={name}
                    onChangeText={setName}
                    style={s.input}
                    placeholderTextColor="#999"
                  />
                  <TextInput
                    placeholder="Phone Number *"
                    value={number}
                    onChangeText={setNumber}
                    keyboardType="phone-pad"
                    style={s.input}
                    placeholderTextColor="#999"
                  />
                  <TextInput
                    placeholder="Description (e.g., Doctor, Family)"
                    value={description}
                    onChangeText={setDescription}
                    style={s.input}
                    placeholderTextColor="#999"
                  />
                  <View style={s.formButtons}>
                    <TouchableOpacity style={s.cancelButton} onPress={() => setShowForm(false)}>
                      <Text style={s.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.saveButton} onPress={handleAddContact}>
                      <LinearGradient colors={["#9C27B0", "#7B1FA2"]} style={s.saveButtonGradient}>
                        <Text style={s.saveButtonText}>Save Contact</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
            )}

            {emergencyContacts.length === 0 ? (
              <View style={s.emptyState}>
                <Ionicons name="person-add-outline" size={64} color="#E0E0E0" />
                <Text style={s.emptyTitle}>No Emergency Contacts</Text>
                <Text style={s.emptySubtitle}>Add contacts for quick access during emergencies</Text>
              </View>
            ) : (
              emergencyContacts.map((contact) => (
                <TouchableOpacity key={contact.id} style={s.contactCard} onPress={() => handleCall(contact.number)}>
                  <View style={s.contactIcon}>
                    <Ionicons name="person" size={24} color="white" />
                  </View>
                  <View style={s.contactInfo}>
                    <Text style={s.contactName}>{contact.name}</Text>
                    <Text style={s.contactDescription}>{contact.description}</Text>
                    <Text style={s.contactNumber}>{contact.number}</Text>
                  </View>
                  <View style={s.contactActions}>
                    <TouchableOpacity onPress={() => handleCall(contact.number)}>
                      <Ionicons name="call" size={20} color="#4CAF50" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteContact(contact.id, contact.name)}>
                      <Ionicons name="trash" size={18} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
        )}
      </ScrollView>

      <TouchableOpacity style={s.fab} onPress={() => handleCall("911")}>
        <LinearGradient colors={["#F44336", "#D32F2F"]} style={s.fabGradient}>
          <Ionicons name="call" size={28} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA" },
  header: {
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "white" },
  headerSubtitle: { fontSize: 16, color: "rgba(255, 255, 255, 0.9)", textAlign: "center" },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF5722",
    marginHorizontal: 20,
    marginTop: -15,
    padding: 15,
    borderRadius: 15,
  },
  alertText: { color: "white", fontSize: 14, fontWeight: "600", marginLeft: 10, flex: 1 },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    marginHorizontal: 5,
    alignItems: "center",
  },
  tabButtonActive: { backgroundColor: "#F44336" },
  tabText: { fontSize: 14, fontWeight: "500", color: "#5D6D7E" },
  tabTextActive: { color: "white" },
  content: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#2C3E50", marginBottom: 15 },
  sectionSubtitle: { fontSize: 14, color: "#7F8C8D", marginBottom: 5 },
  quickActionsGrid: { flexDirection: "row", justifyContent: "space-between", marginBottom: 25 },
  quickActionCard: { width: "30%", borderRadius: 15, padding: 15, alignItems: "center" },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionTitle: { fontSize: 12, fontWeight: "bold", color: "#2C3E50", textAlign: "center" },
  hospitalSection: {
    backgroundColor: "#FFEBEE",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    marginBottom: 25,
  },
  hospitalTitle: { fontSize: 20, fontWeight: "bold", color: "#2C3E50", marginTop: 10, marginBottom: 5 },
  hospitalSubtitle: { fontSize: 14, color: "#7F8C8D", textAlign: "center", marginBottom: 20 },
  findButton: { borderRadius: 25 },
  findButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  findButtonText: { color: "white", fontSize: 16, fontWeight: "bold", marginLeft: 10 },
  locationSection: {
    backgroundColor: "#E8F5E8",
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
  },
  locationInfo: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  locationText: { marginLeft: 15, flex: 1 },
  locationTitle: { fontSize: 16, fontWeight: "bold", color: "#2C3E50" },
  locationSubtitle: { fontSize: 14, color: "#7F8C8D", marginTop: 2 },
  shareLocationButton: { borderRadius: 12 },
  shareButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
  },
  shareButtonText: { color: "white", fontSize: 14, fontWeight: "bold", marginLeft: 8 },
  contactsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  formContainer: {
    marginBottom: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  formGradient: { borderRadius: 20, padding: 20 },
  formTitle: { fontSize: 18, fontWeight: "bold", color: "#2C3E50", marginBottom: 15, textAlign: "center" },
  input: {
    borderColor: "#E0E0E0",
    borderWidth: 1,
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "white",
  },
  formButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  cancelButton: { flex: 0.45, paddingVertical: 15, borderRadius: 12, backgroundColor: "#F5F5F5", alignItems: "center" },
  cancelButtonText: { color: "#7F8C8D", fontSize: 16, fontWeight: "600" },
  saveButton: { flex: 0.45, borderRadius: 12 },
  saveButtonGradient: { paddingVertical: 15, borderRadius: 12, alignItems: "center" },
  saveButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contactIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    backgroundColor: "#9C27B0",
  },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 16, fontWeight: "bold", color: "#2C3E50" },
  contactDescription: { fontSize: 12, color: "#7F8C8D", marginTop: 2 },
  contactNumber: { fontSize: 14, color: "#5D6D7E", fontWeight: "600", marginTop: 4 },
  contactActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyTitle: { fontSize: 18, fontWeight: "bold", color: "#BDC3C7", marginTop: 15, marginBottom: 5 },
  emptySubtitle: { fontSize: 14, color: "#BDC3C7", textAlign: "center" },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    shadowColor: "#F44336",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  fabGradient: { width: 64, height: 64, borderRadius: 32, justifyContent: "center", alignItems: "center" },
})
