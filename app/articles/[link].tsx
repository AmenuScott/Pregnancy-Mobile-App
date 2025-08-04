import { Ionicons } from "@expo/vector-icons"
import { useLocalSearchParams, useRouter } from "expo-router"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { WebView } from "react-native-webview"

const ArticleScreen = () => {
  const { link } = useLocalSearchParams()
  const router = useRouter()

  console.log("Received link param:", link)
  



  // Decode the URL safely
  const decodedLink = decodeURIComponent(Array.isArray(link) ? link[0] : link || "")
    console.log("Decoded link:", decodedLink)
    
  if (!decodedLink.startsWith("http")) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>⚠️ Invalid article link</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Read Article</Text>
        <View style={{ width: 24 }} /> {/* for spacing */}
      </View>

      <WebView source={{ uri: decodedLink }} style={{ flex: 1 }} />
    </View>
  )
}

export default ArticleScreen

const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: "#667eea",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#ef4444",
    marginBottom: 12,
  },
  backButton: {
    color: "#667eea",
    fontWeight: "600",
  },
})
