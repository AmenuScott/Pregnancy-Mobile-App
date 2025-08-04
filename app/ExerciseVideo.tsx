"use client"

import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Dimensions, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { WebView } from "react-native-webview"

const { width } = Dimensions.get("window")
const statusBarHeight = Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 24

const ExerciseVideo = () => {
  const { name, youtubeUrl } = useLocalSearchParams()
  const router = useRouter()

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#C672E5" />

      {/* Modern Header with Gradient */}
      <LinearGradient colors={["#C672E5", "#9B4DCC"]} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {name || "Exercise Video"}
              </Text>
              <View style={styles.headerBadge}>
                <Ionicons name="play-circle-outline" size={12} color="#C672E5" />
                <Text style={styles.headerBadgeText}>Workout Video</Text>
              </View>
            </View>

            {/* Placeholder for a share button or other action */}
            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share-outline" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Video Player Section */}
      <View style={styles.videoContainer}>
        {youtubeUrl ? (
          <WebView
            style={styles.video}
            source={{ uri: youtubeUrl as string }}
            javaScriptEnabled
            allowsFullscreenVideo
            domStorageEnabled={true}
            mediaPlaybackRequiresUserAction={false}
          />
        ) : (
          <View style={styles.noVideoContainer}>
            <Ionicons name="videocam-off-outline" size={80} color="#D1C4E9" />
            <Text style={styles.noVideoText}>Video not available</Text>
            <Text style={styles.noVideoSubtext}>Please check the exercise details.</Text>
          </View>
        )}
      </View>

      {/* Content Area (for future descriptions, benefits, etc.) */}
      <View style={styles.contentArea}>
        <Text style={styles.sectionTitle}>Exercise Details</Text>
        <Text style={styles.sectionDescription}>
          This section can be expanded to include detailed instructions, benefits, and tips for the exercise. For now,
          enjoy the video!
        </Text>
        {/* You can add more content here, e.g., FlatList for steps, related exercises */}
      </View>
    </View>
  )
}

export default ExerciseVideo

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDF7FF", // Light purple background
  },
  safeArea: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    padding: 20,
    paddingTop: statusBarHeight + 10,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 10, // Add some margin to prevent title from touching buttons
  },
  headerTitle: {
    fontSize: 20, // Slightly smaller for better fit in header
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
    textAlign: "center",
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
  },
  headerBadgeText: {
    fontSize: 12,
    color: "#C672E5",
    fontWeight: "600",
    marginLeft: 5,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  videoContainer: {
    width: "100%",
    height: 250, // Fixed height for the video player
    backgroundColor: "#000", // Black background for video area
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  video: {
    width: "100%",
    height: "100%",
  },
  noVideoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    width: "100%",
  },
  noVideoText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#7F8C8D",
    marginTop: 10,
  },
  noVideoSubtext: {
    fontSize: 14,
    color: "#977A9C",
    marginTop: 5,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4B2354",
    marginBottom: 10,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#6D4B75",
    lineHeight: 20,
  },
})
