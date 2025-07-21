"use client";

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Linking,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const HealthTips = () => {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Mama");
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) throw new Error("User ID not found");

        const res = await fetch(`https://pregwell-backend.onrender.com/api/patients/${userId}`);
        const data = await res.json();
        setUserName(data.first_name || "Mama");
      } catch (err) {
        console.error("User fetch error:", err.message);
      }
    };

    const fetchTips = async () => {
      try {
        const res = await fetch("https://pregwell-backend.onrender.com/api/tips");
        const data = await res.json();
        setTips(data.tips || []);
      } catch (err) {
        console.error("Tips fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    fetchTips();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A93E8B" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Gradient Header */}
      <LinearGradient
        colors={["#C67EBF", "#A93E8B"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, paddingLeft: 10 }}>
          <Text style={styles.greeting}>Hi {userName},</Text>
          <Text style={styles.subtitle}>Here are your pregnancy health tips 💡</Text>
        </View>
      </LinearGradient>

      {/* Tips List */}
      <FlatList
        data={tips}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <Animated.View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.title}>{item.title}</Text>
            <TouchableOpacity
              style={styles.readMoreButton}
              onPress={() => Linking.openURL(item.link)}
            >
              <Text style={styles.readMoreText}>Read More</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      />
    </SafeAreaView>
  );
};

export default HealthTips;

// 🌸 Styling with soft, clean PregWell look
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF0F5", // Soft pink
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF0F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  greeting: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#FFE6F2",
    fontSize: 14,
    marginTop: 2,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  title: {
    padding: 12,
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  readMoreButton: {
    backgroundColor: "#FFDDEE",
    padding: 12,
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  readMoreText: {
    color: "#A93E8B",
    fontWeight: "600",
  },
});
