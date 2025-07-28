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

// Baby care tips by age
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
  const [selectedTab, setSelectedTab] = useState("tracker")
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("1")

  // Tracker state
  const [feedingTime, setFeedingTime] = useState("")
  const [feedingType, setFeedingType] = useState("breast")
  const [amount, setAmount] = useState("")
  const [diaperType, setDiaperType] = useState("")
  const [sleepDuration, setSleepDuration] = useState("")
  const [weight, setWeight] = useState("")
  const [length, setLength] = useState("")
  const [notes, setNotes] = useState("")

  const handleSave = () => {
    if (!feedingTime && !amount && !diaperType && !sleepDuration && !weight) {
      Alert.alert("Missing Info", "Please fill in at least one field.")
      return
    }
    Alert.alert("Saved", "Baby care log has been saved!")
    // Reset form
    setFeedingTime("")
    setFeedingType("breast")
    setAmount("")
    setDiaperType("")
    setSleepDuration("")
    setWeight("")
    setLength("")
    setNotes("")
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
            <Text style={styles.statNumber}>12</Text>
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
            { id: "tracker", label: "Daily Tracker", icon: "clipboard" },
            { id: "tips", label: "Care Tips", icon: "bulb" },
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
            <Text style={styles.sectionTitle}>Daily Care Tracker</Text>
            <Text style={styles.sectionSubtitle}>Log your baby's daily activities and milestones</Text>

            {/* Feeding Section */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="nutrition" size={20} color="#4ECDC4" />
                <Text style={styles.cardTitle}>Feeding</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Feeding Time</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 9:00 AM"
                  value={feedingTime}
                  onChangeText={setFeedingTime}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Feeding Type</Text>
                <View style={styles.buttonRow}>
                  {[
                    { key: "breast", label: "Breastfeeding", icon: "heart" },
                    { key: "bottle", label: "Bottle", icon: "wine" },
                  ].map((type) => (
                    <TouchableOpacity
                      key={type.key}
                      style={[styles.optionButton, feedingType === type.key && styles.optionSelected]}
                      onPress={() => setFeedingType(type.key)}
                    >
                      <Ionicons name={type.icon} size={16} color={feedingType === type.key ? "#4ECDC4" : "#7F8C8D"} />
                      <Text style={[styles.optionText, feedingType === type.key && styles.textSelected]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Amount (ml)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 60"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Diaper Section */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="refresh" size={20} color="#44A08D" />
                <Text style={styles.cardTitle}>Diaper Change</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Diaper Type</Text>
                <View style={styles.buttonRow}>
                  {[
                    { key: "Wet", icon: "water" },
                    { key: "Dirty", icon: "warning" },
                    { key: "Both", icon: "checkmark-circle" },
                  ].map((type) => (
                    <TouchableOpacity
                      key={type.key}
                      style={[styles.optionButton, diaperType === type.key && styles.optionSelected]}
                      onPress={() => setDiaperType(type.key)}
                    >
                      <Ionicons name={type.icon} size={16} color={diaperType === type.key ? "#44A08D" : "#7F8C8D"} />
                      <Text style={[styles.optionText, diaperType === type.key && styles.textSelected]}>
                        {type.key}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Sleep & Growth Section */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="moon" size={20} color="#4ECDC4" />
                <Text style={styles.cardTitle}>Sleep & Growth</Text>
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>Sleep Duration (hrs)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 2.5"
                    value={sleepDuration}
                    onChangeText={setSleepDuration}
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                  <Text style={styles.label}>Weight (kg)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 3.8"
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Length (cm)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 50"
                  value={length}
                  onChangeText={setLength}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Notes Section */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="document-text" size={20} color="#44A08D" />
                <Text style={styles.cardTitle}>Additional Notes</Text>
              </View>

              <View style={styles.inputGroup}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Any observations, milestones, or concerns..."
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
              <LinearGradient colors={["#4ECDC4", "#44A08D"]} style={styles.saveGradient}>
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text style={styles.saveText}>Save Care Log</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

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
  trackerSection: {
    marginBottom: 20,
  },
  tipsSection: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputRow: {
    flexDirection: "row",
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: "#2C3E50",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginRight: 8,
    marginBottom: 8,
  },
  optionSelected: {
    backgroundColor: "#E0F7FA",
    borderColor: "#4ECDC4",
  },
  optionText: {
    fontSize: 12,
    color: "#7F8C8D",
    marginLeft: 4,
  },
  textSelected: {
    color: "#4ECDC4",
    fontWeight: "600",
  },
  saveButton: {
    borderRadius: 25,
    overflow: "hidden",
    marginTop: 10,
    shadowColor: "#4ECDC4",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  saveGradient: {
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 25,
    flexDirection: "row",
    justifyContent: "center",
  },
  saveText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
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
    alignItems: "center",
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#00ACC1",
    marginTop: 10,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#00695C",
    textAlign: "center",
    lineHeight: 20,
  },
})

export default BabyCareScreen
