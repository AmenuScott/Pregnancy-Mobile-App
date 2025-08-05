// app/ExerciseVideo.tsx
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Dimensions, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";

const ExerciseVideo = () => {
  const { name, youtubeUrl } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Extract YouTube video ID from various URL formats
  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  // Convert any YouTube URL to proper embed format
  const getEmbedUrl = (url: string): string | null => {
    const videoId = extractVideoId(url);
    if (!videoId) return null;
    
    // Return embed URL with additional parameters for better compatibility
    return `https://www.youtube.com/embed/${videoId}?autoplay=0&fs=1&rel=0&showinfo=0&modestbranding=1`;
  };

  const embedUrl = youtubeUrl ? getEmbedUrl(String(youtubeUrl)) : null;

  const handleWebViewError = () => {
    setHasError(true);
    setIsLoading(false);
    Alert.alert(
      "Video Error",
      "Unable to load the video. Please check your internet connection or try again later.",
      [{ text: "OK" }]
    );
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  if (!embedUrl) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{name || "Exercise Video"}</Text>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Video not available</Text>
          <Text style={styles.subtitle}>
            Invalid YouTube URL provided. Please check the video link.
          </Text>
        </View>
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{name || "Exercise Video"}</Text>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Failed to load video</Text>
          <Text style={styles.subtitle}>
            Please check your internet connection or try again later.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{name || "Exercise Video"}</Text>
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading video...</Text>
        </View>
      )}
      
      <WebView
        style={[styles.video, isLoading && { opacity: 0 }]}
        source={{ 
          uri: embedUrl,
          headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
          }
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsFullscreenVideo={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        onLoadEnd={handleLoadEnd}
        onError={handleWebViewError}
        onHttpError={handleWebViewError}
        startInLoadingState={false}
        mixedContentMode="compatibility"
        originWhitelist={['*']}
      />
    </View>
  );
};

export default ExerciseVideo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: "#FFF5FC",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    margin: 20,
    textAlign: "center",
    color: "#4B2354",
  },
  subtitle: {
    fontSize: 16,
    color: "#6D4B75",
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 20,
  },
  video: {
    width: Dimensions.get("window").width,
    height: 250,
    backgroundColor: "#000",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8B4B8C",
    marginBottom: 10,
    textAlign: "center",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 245, 252, 0.8)",
    zIndex: 1,
  },
  loadingText: {
    fontSize: 16,
    color: "#6D4B75",
    fontWeight: "500",
  },
});